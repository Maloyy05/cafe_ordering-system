const supabase = require('../config/supabase');
const { cache, CACHE_TTL, getProductCacheKey } = require('../services/cache');

const getProducts = async(req, res, next) => {
    try {
        const { status, category_id, search } = req.query;
        const cacheKey = getProductCacheKey(req.query);

        // Check cache first
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }

        let query = supabase
            .from('products')
            .select('*, categories(name)');

        // Filter by status (default to active only for performance)
        if (status) {
            query = query.eq('status', status);
        } else {
            // Default to active products only for better performance
            query = query.neq('status', 'archived');
        }

        if (category_id) {
            query = query.eq('category_id', category_id);
        }

        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        const { data, error } = await query.order('name');
        if (error) throw error;

        // Cache the result
        cache.set(cacheKey, data, CACHE_TTL.PRODUCTS);

        res.json(data);
    } catch (err) {
        next(err);
    }
};

const createProduct = async(req, res, next) => {
    try {
        const payload = req.validatedBody || req.body;

        // Validate that a category is selected
        if (!payload.category_name) {
            return res.status(400).json({ message: 'Category is required' });
        }

        // Assign category_id based on category_name (case-insensitive)
        const categoryName = payload.category_name;
        const categoryId = await getCategoryIdByName(categoryName);

        if (!categoryId) {
            return res.status(400).json({ message: 'Invalid category name' });
        }

        payload.category_id = categoryId;
        delete payload.category_name; // Remove category_name from payload

        // Ensure status is set to 'available' by default
        payload.status = payload.status || 'available';

        const { data, error } = await supabase
            .from('products')
            .insert([payload])
            .select();
        if (error) throw error;

        // Invalidate products cache on any change
        cache.flushAll();

        res.status(201).json(data[0]);
    } catch (err) {
        next(err);
    }
};

const updateProduct = async(req, res, next) => {
    try {
        const payload = req.validatedBody || req.body;
        const { data, error } = await supabase
            .from('products')
            .update(payload)
            .eq('id', req.params.id)
            .select();
        if (error) throw error;

        // Invalidate products cache on any change
        cache.flushAll();

        res.json(data[0]);
    } catch (err) {
        next(err);
    }
};

const deleteProduct = async(req, res, next) => {
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', req.params.id);
        if (error) throw error;

        // Invalidate products cache on any change
        cache.flushAll();

        res.json({ message: 'Product deleted' });
    } catch (err) {
        next(err);
    }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };

const { v4: uuidv4 } = require('uuid');

const uploadProductImage = async(req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const file = req.file; // multer places buffer in file.buffer
        const ext = (file.originalname || '').split('.').pop();
        const filename = `products/${uuidv4()}.${ext}`;

        // Upload to Supabase storage (bucket 'product-images' expected)
        const bucketName = 'product-images';
        let uploadResp;
        try {
            uploadResp = await supabase.storage
                .from(bucketName)
                .upload(filename, file.buffer, { contentType: file.mimetype, upsert: true });
        } catch (e) {
            // Some versions of the client throw; normalize to object
            uploadResp = { error: e };
        }

        let uploadData = uploadResp.data;
        const uploadError = uploadResp.error;

        // If bucket not found, try to create it (only works with service role key)
        if (uploadError && /bucket not found|no bucket/i.test(uploadError.message || '')) {
            // Attempt to create bucket if service role key available
            if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
                try {
                    const { data: createData, error: createError } = await supabase.storage.createBucket(bucketName, { public: true });
                    if (createError) {
                        return res.status(500).json({ message: `Failed to create storage bucket '${bucketName}': ${createError.message || createError}` });
                    }
                    // retry upload
                    const { data: retryData, error: retryError } = await supabase.storage.from(bucketName).upload(filename, file.buffer, { contentType: file.mimetype, upsert: true });
                    if (retryError) {
                        return res.status(500).json({ message: `Upload failed after creating bucket: ${retryError.message || retryError}` });
                    }
                    uploadData = retryData;
                } catch (errCreate) {
                    return res.status(500).json({ message: `Error creating bucket '${bucketName}': ${errCreate.message || errCreate}` });
                }
            } else {
                return res.status(500).json({ message: `Storage bucket '${bucketName}' not found and server lacks SUPABASE_SERVICE_ROLE_KEY to create it.` });
            }
        }

        if (uploadError) {
            return res.status(500).json({ message: uploadError.message || 'Upload failed' });
        }

        // Get public URL
        const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(filename);
        const publicUrl = publicData && publicData.publicUrl ? publicData.publicUrl : null;
        if (!publicUrl) {
            return res.status(500).json({ message: 'Failed to obtain public URL for uploaded image' });
        }

        // If product id provided, update product record
        const productId = req.body.id;
        if (productId) {
            const { data: updated, error: updateError } = await supabase
                .from('products')
                .update({ image_url: publicUrl })
                .eq('id', productId)
                .select();
            if (updateError) throw updateError;
            return res.json({ image_url: publicUrl, product: updated[0] });
        }

        res.json({ image_url: publicUrl });
    } catch (err) {
        next(err);
    }
};

// Helper: get category id by name (case-insensitive)
const getCategoryIdByName = async (name) => {
    const { data, error } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', name)
        .limit(1)
        .single();
    if (error || !data) return null;
    return data.id;
};

const getTeas = async (req, res, next) => {
    try {
        const teaCategoryId = await getCategoryIdByName('tea');
        if (!teaCategoryId) return res.json([]);
        const { data, error } = await supabase
            .from('products')
            .select('*, categories(name)')
            .eq('category_id', teaCategoryId)
            .order('name');
        if (error) throw error;
        res.json(data);
    } catch (err) {
        next(err);
    }
};

const createTeaProduct = async (req, res, next) => {
    try {
        const payload = req.validatedBody || req.body || {};
        // Ensure product is assigned to Tea category
        const teaCategoryId = await getCategoryIdByName('tea');
        if (!teaCategoryId) return res.status(400).json({ message: 'Tea category not configured' });
        payload.category_id = teaCategoryId;
        const { data, error } = await supabase
            .from('products')
            .insert([payload])
            .select();
        if (error) throw error;
        // Invalidate cache
        cache.flushAll();
        res.status(201).json(data[0]);
    } catch (err) {
        next(err);
    }
};

const updateTeaProduct = async (req, res, next) => {
    try {
        const teaCategoryId = await getCategoryIdByName('tea');
        if (!teaCategoryId) return res.status(400).json({ message: 'Tea category not configured' });
        // Ensure product belongs to Tea category
        const { data: existing, error: fetchErr } = await supabase
            .from('products')
            .select('id, category_id')
            .eq('id', req.params.id)
            .limit(1)
            .single();
        if (fetchErr || !existing) return res.status(404).json({ message: 'Product not found' });
        if (existing.category_id !== teaCategoryId) return res.status(403).json({ message: 'Forbidden: not a tea product' });
        const payload = req.validatedBody || req.body || {};
        const { data, error } = await supabase
            .from('products')
            .update(payload)
            .eq('id', req.params.id)
            .select();
        if (error) throw error;
        cache.flushAll();
        res.json(data[0]);
    } catch (err) {
        next(err);
    }
};

const deleteTeaProduct = async (req, res, next) => {
    try {
        const teaCategoryId = await getCategoryIdByName('tea');
        if (!teaCategoryId) return res.status(400).json({ message: 'Tea category not configured' });
        const { data: existing, error: fetchErr } = await supabase
            .from('products')
            .select('id, category_id')
            .eq('id', req.params.id)
            .limit(1)
            .single();
        if (fetchErr || !existing) return res.status(404).json({ message: 'Product not found' });
        if (existing.category_id !== teaCategoryId) return res.status(403).json({ message: 'Forbidden: not a tea product' });
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', req.params.id);
        if (error) throw error;
        cache.flushAll();
        res.json({ message: 'Tea product deleted' });
    } catch (err) {
        next(err);
    }
};

// Upload image for tea product - enforces tea product ownership when updating product
const uploadTeaProductImage = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const file = req.file;
        const ext = (file.originalname || '').split('.').pop();
        const filename = `products/${uuidv4()}.${ext}`;
        const bucketName = 'product-images';
        let uploadResp;
        try {
            uploadResp = await supabase.storage.from(bucketName).upload(filename, file.buffer, { contentType: file.mimetype, upsert: true });
        } catch (e) {
            uploadResp = { error: e };
        }
        let uploadData = uploadResp.data;
        const uploadError = uploadResp.error;
        if (uploadError && /bucket not found|no bucket/i.test(uploadError.message || '')) {
            if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
                const { data: createData, error: createError } = await supabase.storage.createBucket(bucketName, { public: true });
                if (createError) return res.status(500).json({ message: `Failed to create storage bucket '${bucketName}': ${createError.message || createError}` });
                const { data: retryData, error: retryError } = await supabase.storage.from(bucketName).upload(filename, file.buffer, { contentType: file.mimetype, upsert: true });
                if (retryError) return res.status(500).json({ message: `Upload failed after creating bucket: ${retryError.message || retryError}` });
                uploadData = retryData;
            } else {
                return res.status(500).json({ message: `Storage bucket '${bucketName}' not found and server lacks SUPABASE_SERVICE_ROLE_KEY to create it.` });
            }
        }
        if (uploadError) return res.status(500).json({ message: uploadError.message || 'Upload failed' });
        const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(filename);
        const publicUrl = publicData && publicData.publicUrl ? publicData.publicUrl : null;
        if (!publicUrl) return res.status(500).json({ message: 'Failed to obtain public URL for uploaded image' });
        const productId = req.body.id;
        if (productId) {
            // ensure product is tea
            const teaCategoryId = await getCategoryIdByName('tea');
            const { data: existing, error: fetchErr } = await supabase
                .from('products')
                .select('id, category_id')
                .eq('id', productId)
                .limit(1)
                .single();
            if (fetchErr || !existing) return res.status(404).json({ message: 'Product not found' });
            if (existing.category_id !== teaCategoryId) return res.status(403).json({ message: 'Forbidden: not a tea product' });
            const { data: updated, error: updateError } = await supabase
                .from('products')
                .update({ image_url: publicUrl })
                .eq('id', productId)
                .select();
            if (updateError) throw updateError;
            return res.json({ image_url: publicUrl, product: updated[0] });
        }
        res.json({ image_url: publicUrl });
    } catch (err) {
        next(err);
    }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct, uploadProductImage, getTeas, createTeaProduct, updateTeaProduct, deleteTeaProduct, uploadTeaProductImage };

// --- Cookie handlers (admin+staff manage cookies) ---
const getCookies = async (req, res, next) => {
    try {
        const cookieCategoryId = await getCategoryIdByName('cookies');
        if (!cookieCategoryId) return res.json([]);
        const { data, error } = await supabase
            .from('products')
            .select('*, categories(name)')
            .eq('category_id', cookieCategoryId)
            .order('name');
        if (error) throw error;
        res.json(data);
    } catch (err) {
        next(err);
    }
};

const createCookieProduct = async (req, res, next) => {
    try {
        const payload = req.validatedBody || req.body || {};
        const cookieCategoryId = await getCategoryIdByName('cookies');
        if (!cookieCategoryId) return res.status(400).json({ message: 'Cookies category not configured' });
        payload.category_id = cookieCategoryId;
        const { data, error } = await supabase
            .from('products')
            .insert([payload])
            .select();
        if (error) throw error;
        cache.flushAll();
        res.status(201).json(data[0]);
    } catch (err) {
        next(err);
    }
};

const updateCookieProduct = async (req, res, next) => {
    try {
        const cookieCategoryId = await getCategoryIdByName('cookies');
        if (!cookieCategoryId) return res.status(400).json({ message: 'Cookies category not configured' });
        const { data: existing, error: fetchErr } = await supabase
            .from('products')
            .select('id, category_id')
            .eq('id', req.params.id)
            .limit(1)
            .single();
        if (fetchErr || !existing) return res.status(404).json({ message: 'Product not found' });
        if (existing.category_id !== cookieCategoryId) return res.status(403).json({ message: 'Forbidden: not a cookie product' });
        const payload = req.validatedBody || req.body || {};
        const { data, error } = await supabase
            .from('products')
            .update(payload)
            .eq('id', req.params.id)
            .select();
        if (error) throw error;
        cache.flushAll();
        res.json(data[0]);
    } catch (err) {
        next(err);
    }
};

const deleteCookieProduct = async (req, res, next) => {
    try {
        const cookieCategoryId = await getCategoryIdByName('cookies');
        if (!cookieCategoryId) return res.status(400).json({ message: 'Cookies category not configured' });
        const { data: existing, error: fetchErr } = await supabase
            .from('products')
            .select('id, category_id')
            .eq('id', req.params.id)
            .limit(1)
            .single();
        if (fetchErr || !existing) return res.status(404).json({ message: 'Product not found' });
        if (existing.category_id !== cookieCategoryId) return res.status(403).json({ message: 'Forbidden: not a pastry product' });
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', req.params.id);
        if (error) throw error;
        cache.flushAll();
        res.json({ message: 'Cookie product deleted' });
    } catch (err) {
        next(err);
    }
};

const uploadCookieProductImage = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const file = req.file;
        const ext = (file.originalname || '').split('.').pop();
        const filename = `products/${uuidv4()}.${ext}`;
        const bucketName = 'product-images';
        let uploadResp;
        try {
            uploadResp = await supabase.storage.from(bucketName).upload(filename, file.buffer, { contentType: file.mimetype, upsert: true });
        } catch (e) {
            uploadResp = { error: e };
        }
        let uploadData = uploadResp.data;
        const uploadError = uploadResp.error;
        if (uploadError && /bucket not found|no bucket/i.test(uploadError.message || '')) {
            if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
                const { data: createData, error: createError } = await supabase.storage.createBucket(bucketName, { public: true });
                if (createError) return res.status(500).json({ message: `Failed to create storage bucket '${bucketName}': ${createError.message || createError}` });
                const { data: retryData, error: retryError } = await supabase.storage.from(bucketName).upload(filename, file.buffer, { contentType: file.mimetype, upsert: true });
                if (retryError) return res.status(500).json({ message: `Upload failed after creating bucket: ${retryError.message || retryError}` });
                uploadData = retryData;
            } else {
                return res.status(500).json({ message: `Storage bucket '${bucketName}' not found and server lacks SUPABASE_SERVICE_ROLE_KEY to create it.` });
            }
        }
        if (uploadError) return res.status(500).json({ message: uploadError.message || 'Upload failed' });
        const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(filename);
        const publicUrl = publicData && publicData.publicUrl ? publicData.publicUrl : null;
        if (!publicUrl) return res.status(500).json({ message: 'Failed to obtain public URL for uploaded image' });
        const productId = req.body.id;
        if (productId) {
            const cookieCategoryId = await getCategoryIdByName('pastries');
            const { data: existing, error: fetchErr } = await supabase
                .from('products')
                .select('id, category_id')
                .eq('id', productId)
                .limit(1)
                .single();
            if (fetchErr || !existing) return res.status(404).json({ message: 'Product not found' });
            if (existing.category_id !== cookieCategoryId) return res.status(403).json({ message: 'Forbidden: not a cookie product' });
            const { data: updated, error: updateError } = await supabase
                .from('products')
                .update({ image_url: publicUrl })
                .eq('id', productId)
                .select();
            if (updateError) throw updateError;
            return res.json({ image_url: publicUrl, product: updated[0] });
        }
        res.json({ image_url: publicUrl });
    } catch (err) {
        next(err);
    }
};

// Extend export
module.exports.getCookies = getCookies;
module.exports.createCookieProduct = createCookieProduct;
module.exports.updateCookieProduct = updateCookieProduct;
module.exports.deleteCookieProduct = deleteCookieProduct;
module.exports.uploadCookieProductImage = uploadCookieProductImage;