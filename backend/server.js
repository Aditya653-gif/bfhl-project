const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/bfhl", (req, res) => {
    const data = req.body.data || [];

    let validEdges = [];
    let invalid_entries = [];
    let duplicate_edges = [];

    let seen = new Set();

    data.forEach((item) => {
        item = item.trim();

        if (!/^[A-Z]->[A-Z]$/.test(item) || item[0] === item[3]) {
            invalid_entries.push(item);
        } else {
            if (seen.has(item)) {
                if (!duplicate_edges.includes(item))
                    duplicate_edges.push(item);
            } else {
                seen.add(item);
                validEdges.push(item);
            }
        }
    });

    let graph = {};
    let childrenSet = new Set();

    validEdges.forEach(edge => {
        let [p, c] = edge.split("->");

        if (!graph[p]) graph[p] = {};
        graph[p][c] = {};

        childrenSet.add(c);
    });

    let roots = Object.keys(graph).filter(n => !childrenSet.has(n));

    let hierarchies = [];

    function depth(node) {
        if (!graph[node]) return 1;
        let max = 0;
        for (let child in graph[node]) {
            max = Math.max(max, depth(child));
        }
        return max + 1;
    }

    roots.forEach(root => {
        hierarchies.push({
            root,
            tree: { [root]: graph[root] },
            depth: depth(root)
        });
    });

    res.json({
        user_id: "yourname_ddmmyyyy",
        email_id: "yourmail@srmist.edu.in",
        college_roll_number: "yourroll",
        hierarchies,
        invalid_entries,
        duplicate_edges,
        summary: {
            total_trees: hierarchies.length,
            total_cycles: 0,
            largest_tree_root: hierarchies.length ? hierarchies[0].root : ""
        }
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});