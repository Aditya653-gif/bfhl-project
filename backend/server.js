const express = require("express");
const cors = require("cors");

const app = express();

// ✅ CORS (very important)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

// ✅ JSON parser
app.use(express.json());

// ✅ Extra headers (for strict browsers)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});


// 🔹 Helper function to build hierarchy
function buildHierarchy(edges) {
  const tree = {};
  const children = new Set();
  const nodes = new Set();

  edges.forEach(edge => {
    const [parent, child] = edge.split("->");

    nodes.add(parent);
    nodes.add(child);
    children.add(child);

    if (!tree[parent]) tree[parent] = {};
    tree[parent][child] = {};
  });

  // find root (node that is never a child)
  let root = "";
  for (let node of nodes) {
    if (!children.has(node)) {
      root = node;
      break;
    }
  }

  // calculate depth
  function getDepth(node) {
    if (!tree[node] || Object.keys(tree[node]).length === 0) return 1;

    let max = 0;
    for (let child in tree[node]) {
      max = Math.max(max, getDepth(child));
    }
    return max + 1;
  }

  return {
    root,
    tree,
    depth: getDepth(root)
  };
}


// 🚀 API
app.post("/bfhl", (req, res) => {
  const data = req.body.data || [];

  const valid = [];
  const invalid_entries = [];

  // validate edges
  data.forEach(edge => {
    if (typeof edge === "string" && edge.includes("->")) {
      valid.push(edge);
    } else {
      invalid_entries.push(edge);
    }
  });

  const hierarchy = buildHierarchy(valid);

  res.json({
    user_id: "yourname_ddmmyyyy",
    email_id: "yourmail@srmist.edu.in",
    college_roll_number: "yourroll",

    hierarchies: [hierarchy],
    invalid_entries,
    duplicate_edges: [],

    summary: {
      total_trees: 1,
      total_cycles: 0,
      largest_tree_root: hierarchy.root
    }
  });
});


// ✅ IMPORTANT for Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});