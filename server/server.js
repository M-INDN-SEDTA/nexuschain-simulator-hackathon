
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// --- SETUP DIRECTORIES ---
const DB_DIR = path.join(__dirname, 'db');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR);
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

const USERS_FILE = path.join(DB_DIR, 'users.json');
const NFTS_FILE = path.join(DB_DIR, 'nfts.json');
const TRANSACTIONS_FILE = path.join(DB_DIR, 'transactions.json');
const TRADE_REQUESTS_FILE = path.join(DB_DIR, 'trade_requests.json');

// --- MULTER CONFIG (FILE UPLOADS) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});

const upload = multer({ storage: storage });

// --- HELPERS ---
const readJSON = (file) => {
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return [];
  }
};

const writeJSON = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// --- AUTH ROUTES ---

// POST /api/signup
app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;
  const users = readJSON(USERS_FILE);

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: "User already exists" });
  }

  const newUser = {
    id: 'U-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
    email,
    password, // In a real app, HASH this!
    name,
    walletAddress: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    balance: 100, // Sign up bonus
    savedItems: [],
    profileImage: ''
  };

  users.push(newUser);
  writeJSON(USERS_FILE, users);

  // Return user without password
  const { password: _, ...userSafe } = newUser;
  res.json(userSafe);
});

// POST /api/login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const users = readJSON(USERS_FILE);

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const { password: _, ...userSafe } = user;
  res.json(userSafe);
});

app.get('/api/users/:id', (req, res) => {
    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password: _, ...userSafe } = user;
    res.json(userSafe);
});

// POST /api/users/:id/topup
app.post('/api/users/:id/topup', (req, res) => {
    const { amount } = req.body;
    const users = readJSON(USERS_FILE);
    const userIndex = users.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) return res.status(404).json({ error: "User not found" });
    
    users[userIndex].balance += Number(amount);
    writeJSON(USERS_FILE, users);

    const { password: _, ...userSafe } = users[userIndex];
    res.json(userSafe);
});

// PUT /api/users/:id (Update Profile)
app.put('/api/users/:id', (req, res) => {
    const { password, profileImage } = req.body;
    const users = readJSON(USERS_FILE);
    const userIndex = users.findIndex(u => u.id === req.params.id);

    if (userIndex === -1) return res.status(404).json({ error: "User not found" });

    if (password) users[userIndex].password = password;
    if (profileImage !== undefined) users[userIndex].profileImage = profileImage;

    writeJSON(USERS_FILE, users);
    
    const { password: _, ...userSafe } = users[userIndex];
    res.json(userSafe);
});

// --- NFT ROUTES ---

app.get('/api/nfts', (req, res) => {
  let nfts = readJSON(NFTS_FILE);
  const { search, category, sort, date } = req.query;
  
  // 1. Search Filter
  if (search) {
    const lowerSearch = search.toLowerCase();
    nfts = nfts.filter(n => 
      n.metadata.name.toLowerCase().includes(lowerSearch) ||
      n.type.toLowerCase().includes(lowerSearch) ||
      n.metadata.creator.toLowerCase().includes(lowerSearch) ||
      n.id.toLowerCase().includes(lowerSearch)
    );
  }

  // 2. Category Filter
  if (category && category !== 'ALL') {
      nfts = nfts.filter(n => n.type === category);
  }

  // 3. Date Filter (Exact Date Match YYYY-MM-DD)
  if (date) {
      nfts = nfts.filter(n => {
          const nftDate = new Date(n.metadata.createdDate).toISOString().split('T')[0];
          return nftDate === date;
      });
  }

  // 4. Sorting
  if (sort === 'OLDEST') {
      nfts.sort((a, b) => a.metadata.createdDate - b.metadata.createdDate);
  } else {
      // Default NEWEST
      nfts.sort((a, b) => b.metadata.createdDate - a.metadata.createdDate);
  }
  
  res.json(nfts);
});

app.get('/api/nfts/:id', (req, res) => {
    const nfts = readJSON(NFTS_FILE);
    const nft = nfts.find(n => n.id === req.params.id);
    if (!nft) return res.status(404).json({ error: "NFT not found" });
    res.json(nft);
});

// PUT /api/nfts/:id (Update NFT details like price/sale status)
app.put('/api/nfts/:id', (req, res) => {
    const { price, isForSale } = req.body;
    const nfts = readJSON(NFTS_FILE);
    const index = nfts.findIndex(n => n.id === req.params.id);
    
    if (index === -1) return res.status(404).json({ error: "NFT not found" });

    // Update fields if provided
    if (price !== undefined) nfts[index].price = Number(price);
    if (isForSale !== undefined) nfts[index].isForSale = Boolean(isForSale);

    writeJSON(NFTS_FILE, nfts);
    res.json(nfts[index]);
});

// POST /api/nfts (With File Upload)
app.post('/api/nfts', upload.array('images', 8), (req, res) => {
  try {
    const { type, owner, name, description, size, creator, price, isForSale, attributes } = req.body;
    
    // Process uploaded files to get URLs
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

    const nfts = readJSON(NFTS_FILE);
    const transactions = readJSON(TRANSACTIONS_FILE);
    
    // Generate Short UUID
    const id = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    const newNFT = {
      id,
      type,
      owner,
      metadata: {
          name,
          description,
          images: imageUrls,
          size,
          creator,
          attributes: attributes ? JSON.parse(attributes) : [],
          createdDate: Date.now()
      },
      txHash: '0x' + Math.random().toString(16).substr(2, 64),
      price: Number(price) || 0,
      isForSale: isForSale === 'true',
      history: [],
      likes: []
    };

    nfts.push(newNFT);

    // Record Transaction
    const tx = {
        txId: 'TX-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        from: 'SYSTEM',
        to: owner,
        tokenId: id,
        type: 'MINT',
        timestamp: Date.now(),
        data: `Minted ${type} Asset`
    };
    transactions.push(tx);

    writeJSON(NFTS_FILE, nfts);
    writeJSON(TRANSACTIONS_FILE, transactions);
    
    res.json(newNFT);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process minting" });
  }
});

app.post('/api/nfts/:id/toggle-save', (req, res) => {
    const { userId } = req.body;
    const users = readJSON(USERS_FILE);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return res.status(404).json({ error: "User not found" });

    const user = users[userIndex];
    if (user.savedItems.includes(req.params.id)) {
        user.savedItems = user.savedItems.filter(id => id !== req.params.id);
    } else {
        user.savedItems.push(req.params.id);
    }

    users[userIndex] = user;
    writeJSON(USERS_FILE, users);
    res.json(user);
});

// --- TRADE REQUEST ROUTES ---

app.post('/api/trade-request', (req, res) => {
    const { nftId, buyerId } = req.body;
    const requests = readJSON(TRADE_REQUESTS_FILE);
    const nfts = readJSON(NFTS_FILE);
    const users = readJSON(USERS_FILE);

    const nft = nfts.find(n => n.id === nftId);
    if (!nft) return res.status(404).json({ error: "NFT not found" });
    if (!nft.isForSale) return res.status(400).json({ error: "Not for sale" });

    const buyer = users.find(u => u.id === buyerId);
    if (!buyer) return res.status(404).json({ error: "Buyer not found" });
    
    // Check if buyer has funds (pre-check)
    if (buyer.balance < nft.price) {
        return res.status(400).json({ error: "Insufficient funds" });
    }

    const seller = users.find(u => u.id === nft.owner);

    const newRequest = {
        id: 'REQ-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        nftId: nft.id,
        buyerId: buyer.id,
        sellerId: nft.owner,
        price: nft.price,
        status: 'PENDING',
        timestamp: Date.now(),
        nftName: nft.metadata.name,
        buyerName: buyer.name,
        sellerName: seller ? seller.name : 'Unknown',
        nftImage: nft.metadata.images && nft.metadata.images.length > 0 ? nft.metadata.images[0] : ''
    };

    requests.push(newRequest);
    writeJSON(TRADE_REQUESTS_FILE, requests);
    res.json(newRequest);
});

app.get('/api/trade-requests/:userId', (req, res) => {
    const requests = readJSON(TRADE_REQUESTS_FILE);
    const userId = req.params.userId;
    // Filter requests where user is buyer OR seller
    const userRequests = requests.filter(r => r.buyerId === userId || r.sellerId === userId);
    res.json(userRequests.reverse());
});

app.post('/api/trade-request/:id/action', (req, res) => {
    const { action } = req.body; // 'accept' or 'reject'
    const requests = readJSON(TRADE_REQUESTS_FILE);
    const reqIndex = requests.findIndex(r => r.id === req.params.id);

    if (reqIndex === -1) return res.status(404).json({ error: "Request not found" });

    const request = requests[reqIndex];
    if (request.status !== 'PENDING') return res.status(400).json({ error: "Request already processed" });

    if (action === 'reject') {
        request.status = 'REJECTED';
        requests[reqIndex] = request;
        writeJSON(TRADE_REQUESTS_FILE, requests);
        return res.json({ success: true, request });
    }

    if (action === 'accept') {
        // --- ATOMIC TRANSFER LOGIC ---
        const nfts = readJSON(NFTS_FILE);
        const users = readJSON(USERS_FILE);
        const transactions = readJSON(TRANSACTIONS_FILE);

        const nftIndex = nfts.findIndex(n => n.id === request.nftId);
        const buyerIndex = users.findIndex(u => u.id === request.buyerId);
        const sellerIndex = users.findIndex(u => u.id === request.sellerId);

        if (nftIndex === -1 || buyerIndex === -1 || sellerIndex === -1) {
            return res.status(400).json({ error: "Data integrity error" });
        }

        const buyer = users[buyerIndex];
        const seller = users[sellerIndex];
        const nft = nfts[nftIndex];

        if (buyer.balance < request.price) {
            return res.status(400).json({ error: "Buyer has insufficient funds now" });
        }

        // 1. Transfer Money
        buyer.balance -= request.price;
        seller.balance += request.price;

        // 2. Transfer Ownership
        const oldOwner = nft.owner;
        nft.owner = buyer.id;
        nft.isForSale = false; // Delist after sale
        nft.history.push({
            from: oldOwner,
            to: buyer.id,
            price: request.price,
            date: Date.now()
        });

        // 3. Record Transaction
        const tx = {
            txId: 'TX-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            from: oldOwner,
            to: buyer.id,
            tokenId: nft.id,
            type: 'SALE',
            price: request.price,
            timestamp: Date.now(),
            data: `Sold for ${request.price} ETH`
        };
        transactions.push(tx);

        // 4. Update Request
        request.status = 'ACCEPTED';

        // SAVE ALL
        users[buyerIndex] = buyer;
        users[sellerIndex] = seller;
        nfts[nftIndex] = nft;
        requests[reqIndex] = request;

        writeJSON(USERS_FILE, users);
        writeJSON(NFTS_FILE, nfts);
        writeJSON(TRANSACTIONS_FILE, transactions);
        writeJSON(TRADE_REQUESTS_FILE, requests);

        return res.json({ success: true, request });
    }

    res.status(400).json({ error: "Invalid action" });
});

// --- TRANSACTION EXPLORER ROUTES ---

app.get('/api/transactions', (req, res) => {
    const transactions = readJSON(TRANSACTIONS_FILE);
    // Return newest first
    res.json(transactions.reverse()); 
});

app.listen(PORT, () => {
  console.log(`NexusChain Server running on http://localhost:${PORT}`);
});
