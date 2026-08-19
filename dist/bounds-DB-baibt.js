//#region src/core/constants.js
var e = "__virtual_root__", t = 26, n = 80, r = [
	"AutoSmart",
	"GridSmart",
	"Balanced",
	"Center",
	"Left",
	"Right",
	"Alternate",
	"AlternateLeft",
	"AlternateRight",
	"Matrix"
], i = [
	"TopToBottom",
	"BottomToTop",
	"LeftToRight",
	"RightToLeft"
], a = {
	orientation: "TopToBottom",
	subtreeMode: "AutoSmart",
	spacingX: 40,
	spacingY: 70,
	gridSize: 22,
	alignGrid: !1
}, o = {
	width: 240,
	height: 70
}, s = {
	width: 196,
	height: 188
};
//#endregion
//#region src/core/tree.js
function c(e) {
	let t = Object.create(null);
	for (let n of e) t[n.id] = n;
	return t;
}
function l(t) {
	let n = Object.create(null);
	for (let e of t) n[e.id] = {
		node: e,
		children: []
	};
	let r = {
		node: {
			id: e,
			isVirtual: !0,
			width: 0,
			height: 0,
			type: "virtual",
			collapsed: !1,
			layoutMode: "Balanced"
		},
		children: []
	};
	for (let e of t) {
		let t = n[e.id], i = e.parentId;
		i && n[i] ? n[i].children.push(t) : r.children.push(t);
	}
	return r;
}
function u(e) {
	let t = {
		node: e.node,
		children: []
	};
	if (!e.node.collapsed) for (let n of e.children) t.children.push(u(n));
	return t;
}
function d(e) {
	let t = Object.create(null);
	return (function e(n, r) {
		n.node.isVirtual || (t[n.node.id] = r);
		let i = n.node.isVirtual ? 0 : r + 1;
		for (let t of n.children) e(t, i);
	})(e, 0), t;
}
function f(e, t) {
	let n = Object.create(null);
	function r(e) {
		if (e in n) return n[e];
		let i = t[e];
		return !i || !i.parentId ? n[e] = 0 : n[e] = r(i.parentId) + 1;
	}
	for (let t of e) r(t.id);
	return n;
}
function p(e, t) {
	let n = 0;
	for (let r of e) r.parentId === t && n++;
	return n;
}
//#endregion
//#region node_modules/@dagrejs/dagre/dist/dagre.esm.js
var m = Object.defineProperty;
((e, t) => {
	for (var n in t) m(e, n, {
		get: t[n],
		enumerable: !0
	});
})({}, {
	Graph: () => he,
	alg: () => D
});
var h = Object.defineProperty, g = (e, t) => {
	for (var n in t) h(e, n, {
		get: t[n],
		enumerable: !0
	});
}, _ = class {
	constructor(e) {
		this._isDirected = !0, this._isMultigraph = !1, this._isCompound = !1, this._nodes = {}, this._in = {}, this._preds = {}, this._out = {}, this._sucs = {}, this._edgeObjs = {}, this._edgeLabels = {}, this._nodeCount = 0, this._edgeCount = 0, this._defaultNodeLabelFn = () => {}, this._defaultEdgeLabelFn = () => {}, e && (this._isDirected = "directed" in e ? e.directed : !0, this._isMultigraph = "multigraph" in e && e.multigraph, this._isCompound = "compound" in e && e.compound), this._isCompound && (this._parent = {}, this._children = {}, this._children["\0"] = {});
	}
	isDirected() {
		return this._isDirected;
	}
	isMultigraph() {
		return this._isMultigraph;
	}
	isCompound() {
		return this._isCompound;
	}
	setGraph(e) {
		return this._label = e, this;
	}
	graph() {
		return this._label;
	}
	setDefaultNodeLabel(e) {
		return this._defaultNodeLabelFn = typeof e == "function" ? e : () => e, this;
	}
	nodeCount() {
		return this._nodeCount;
	}
	nodes() {
		return Object.keys(this._nodes);
	}
	sources() {
		return this.nodes().filter((e) => Object.keys(this._in[e]).length === 0);
	}
	sinks() {
		return this.nodes().filter((e) => Object.keys(this._out[e]).length === 0);
	}
	setNodes(e, t) {
		return e.forEach((e) => {
			t === void 0 ? this.setNode(e) : this.setNode(e, t);
		}), this;
	}
	setNode(e, t) {
		return e in this._nodes ? (arguments.length > 1 && (this._nodes[e] = t), this) : (this._nodes[e] = arguments.length > 1 ? t : this._defaultNodeLabelFn(e), this._isCompound && (this._parent[e] = "\0", this._children[e] = {}, this._children["\0"][e] = !0), this._in[e] = {}, this._preds[e] = {}, this._out[e] = {}, this._sucs[e] = {}, ++this._nodeCount, this);
	}
	node(e) {
		return this._nodes[e];
	}
	hasNode(e) {
		return e in this._nodes;
	}
	removeNode(e) {
		if (e in this._nodes) {
			let t = (e) => this.removeEdge(this._edgeObjs[e]);
			delete this._nodes[e], this._isCompound && (this._removeFromParentsChildList(e), delete this._parent[e], this.children(e).forEach((e) => {
				this.setParent(e);
			}), delete this._children[e]), Object.keys(this._in[e]).forEach(t), delete this._in[e], delete this._preds[e], Object.keys(this._out[e]).forEach(t), delete this._out[e], delete this._sucs[e], --this._nodeCount;
		}
		return this;
	}
	setParent(e, t) {
		if (!this._isCompound) throw Error("Cannot set parent in a non-compound graph");
		if (t === void 0) t = "\0";
		else {
			t += "";
			for (let n = t; n !== void 0; n = this.parent(n)) if (n === e) throw Error("Setting " + t + " as parent of " + e + " would create a cycle");
			this.setNode(t);
		}
		return this.setNode(e), this._removeFromParentsChildList(e), this._parent[e] = t, this._children[t][e] = !0, this;
	}
	parent(e) {
		if (this._isCompound) {
			let t = this._parent[e];
			if (t !== "\0") return t;
		}
	}
	children(e = "\0") {
		if (this._isCompound) {
			let t = this._children[e];
			if (t) return Object.keys(t);
		} else {
			if (e === "\0") return this.nodes();
			if (this.hasNode(e)) return [];
		}
		return [];
	}
	predecessors(e) {
		let t = this._preds[e];
		if (t) return Object.keys(t);
	}
	successors(e) {
		let t = this._sucs[e];
		if (t) return Object.keys(t);
	}
	neighbors(e) {
		let t = this.predecessors(e);
		if (t) {
			let n = new Set(t), r = this.successors(e);
			if (r) for (let e of r) n.add(e);
			return Array.from(n.values());
		}
	}
	isLeaf(e) {
		let t;
		return t = this.isDirected() ? this.successors(e) : this.neighbors(e), (t?.length ?? 0) === 0;
	}
	filterNodes(e) {
		let t = new this.constructor({
			directed: this._isDirected,
			multigraph: this._isMultigraph,
			compound: this._isCompound
		});
		t.setGraph(this.graph()), Object.entries(this._nodes).forEach(([n, r]) => {
			e(n) && t.setNode(n, r);
		}), Object.values(this._edgeObjs).forEach((e) => {
			t.hasNode(e.v) && t.hasNode(e.w) && t.setEdge(e, this.edge(e));
		});
		let n = {}, r = (e) => {
			let i = this.parent(e);
			return !i || t.hasNode(i) ? (n[e] = i, i) : i in n ? n[i] : r(i);
		};
		return this._isCompound && t.nodes().forEach((e) => t.setParent(e, r(e))), t;
	}
	setDefaultEdgeLabel(e) {
		return this._defaultEdgeLabelFn = typeof e == "function" ? e : () => e, this;
	}
	edgeCount() {
		return this._edgeCount;
	}
	edges() {
		return Object.values(this._edgeObjs);
	}
	setPath(e, t) {
		return e.reduce((e, n) => (t === void 0 ? this.setEdge(e, n) : this.setEdge(e, n, t), n)), this;
	}
	setEdge(e, t, n, r) {
		let i, a, o, s, c = !1;
		typeof e == "object" && e && "v" in e ? (i = e.v, a = e.w, o = e.name, arguments.length === 2 && (s = t, c = !0)) : (i = e, a = t, o = r, arguments.length > 2 && (s = n, c = !0)), i = "" + i, a = "" + a, o !== void 0 && (o = "" + o);
		let l = b(this._isDirected, i, a, o);
		if (l in this._edgeLabels) return c && (this._edgeLabels[l] = s), this;
		if (o !== void 0 && !this._isMultigraph) throw Error("Cannot set a named edge when isMultigraph = false");
		this.setNode(i), this.setNode(a), this._edgeLabels[l] = c ? s : this._defaultEdgeLabelFn(i, a, o);
		let u = x(this._isDirected, i, a, o);
		return i = u.v, a = u.w, Object.freeze(u), this._edgeObjs[l] = u, v(this._preds[a], i), v(this._sucs[i], a), this._in[a][l] = u, this._out[i][l] = u, this._edgeCount++, this;
	}
	edge(e, t, n) {
		let r = arguments.length === 1 ? S(this._isDirected, e) : b(this._isDirected, e, t, n);
		return this._edgeLabels[r];
	}
	edgeAsObj(e, t, n) {
		let r = arguments.length === 1 ? this.edge(e) : this.edge(e, t, n);
		return typeof r != "object" || !r ? { label: r } : r;
	}
	hasEdge(e, t, n) {
		return (arguments.length === 1 ? S(this._isDirected, e) : b(this._isDirected, e, t, n)) in this._edgeLabels;
	}
	removeEdge(e, t, n) {
		let r = arguments.length === 1 ? S(this._isDirected, e) : b(this._isDirected, e, t, n), i = this._edgeObjs[r];
		if (i) {
			let e = i.v, t = i.w;
			delete this._edgeLabels[r], delete this._edgeObjs[r], y(this._preds[t], e), y(this._sucs[e], t), delete this._in[t][r], delete this._out[e][r], this._edgeCount--;
		}
		return this;
	}
	inEdges(e, t) {
		return this.isDirected() ? this.filterEdges(this._in[e], e, t) : this.nodeEdges(e, t);
	}
	outEdges(e, t) {
		return this.isDirected() ? this.filterEdges(this._out[e], e, t) : this.nodeEdges(e, t);
	}
	nodeEdges(e, t) {
		if (e in this._nodes) return this.filterEdges({
			...this._in[e],
			...this._out[e]
		}, e, t);
	}
	_removeFromParentsChildList(e) {
		delete this._children[this._parent[e]][e];
	}
	filterEdges(e, t, n) {
		if (!e) return;
		let r = Object.values(e);
		return n ? r.filter((e) => e.v === t && e.w === n || e.v === n && e.w === t) : r;
	}
};
function v(e, t) {
	e[t] ? e[t]++ : e[t] = 1;
}
function y(e, t) {
	e[t] !== void 0 && !--e[t] && delete e[t];
}
function b(e, t, n, r) {
	let i = "" + t, a = "" + n;
	if (!e && i > a) {
		let e = i;
		i = a, a = e;
	}
	return i + "" + a + "" + (r === void 0 ? "\0" : r);
}
function x(e, t, n, r) {
	let i = "" + t, a = "" + n;
	if (!e && i > a) {
		let e = i;
		i = a, a = e;
	}
	let o = {
		v: i,
		w: a
	};
	return r && (o.name = r), o;
}
function S(e, t) {
	return b(e, t.v, t.w, t.name);
}
g({}, {
	read: () => E,
	write: () => C
});
function C(e) {
	let t = {
		options: {
			directed: e.isDirected(),
			multigraph: e.isMultigraph(),
			compound: e.isCompound()
		},
		nodes: w(e),
		edges: T(e)
	}, n = e.graph();
	return n !== void 0 && (t.value = structuredClone(n)), t;
}
function w(e) {
	return e.nodes().map((t) => {
		let n = e.node(t), r = e.parent(t), i = { v: t };
		return n !== void 0 && (i.value = n), r !== void 0 && (i.parent = r), i;
	});
}
function T(e) {
	return e.edges().map((t) => {
		let n = e.edge(t), r = {
			v: t.v,
			w: t.w
		};
		return t.name !== void 0 && (r.name = t.name), n !== void 0 && (r.value = n), r;
	});
}
function E(e) {
	let t = new _(e.options);
	return e.value !== void 0 && t.setGraph(e.value), e.nodes.forEach((e) => {
		t.setNode(e.v, e.value), e.parent && t.setParent(e.v, e.parent);
	}), e.edges.forEach((e) => {
		t.setEdge({
			v: e.v,
			w: e.w,
			name: e.name
		}, e.value);
	}), t;
}
var D = {};
g(D, {
	CycleException: () => F,
	bellmanFord: () => te,
	components: () => O,
	dijkstra: () => re,
	dijkstraAll: () => M,
	findCycles: () => ie,
	floydWarshall: () => P,
	isAcyclic: () => I,
	postorder: () => de,
	preorder: () => L,
	prim: () => fe,
	shortestPaths: () => pe,
	tarjan: () => N,
	topsort: () => se
});
var ee = () => 1;
function te(e, t, n, r) {
	return ne(e, String(t), n || ee, r || function(t) {
		return e.outEdges(t) ?? [];
	});
}
function ne(e, t, n, r) {
	let i = {}, a, o = 0, s = e.nodes(), c = function(e) {
		let t = i[e.v], r = i[e.w];
		if (!t || !r) return;
		let o = n(e);
		t.distance + o < r.distance && (i[e.w] = {
			distance: t.distance + o,
			predecessor: e.v
		}, a = !0);
	}, l = function() {
		s.forEach(function(e) {
			r(e).forEach(function(t) {
				let n = t.v === e ? t.v : t.w, r = n === t.v ? t.w : t.v;
				c({
					v: n,
					w: r
				});
			});
		});
	};
	s.forEach(function(e) {
		i[e] = {
			distance: e === t ? 0 : Infinity,
			predecessor: ""
		};
	});
	let u = s.length;
	for (let e = 1; e < u && (a = !1, o++, l(), a); e++);
	if (o === u - 1 && (a = !1, l(), a)) throw Error("The graph contains a negative weight cycle");
	return i;
}
function O(e) {
	let t = {}, n = [], r;
	function i(n) {
		var a, o;
		n in t || (t[n] = !0, r.push(n), (a = e.successors(n)) == null || a.forEach(i), (o = e.predecessors(n)) == null || o.forEach(i));
	}
	return e.nodes().forEach(function(e) {
		r = [], i(e), r.length && n.push(r);
	}), n;
}
var k = class {
	constructor() {
		this._arr = [], this._keyIndices = {};
	}
	size() {
		return this._arr.length;
	}
	keys() {
		return this._arr.map((e) => e.key);
	}
	has(e) {
		return e in this._keyIndices;
	}
	priority(e) {
		let t = this._keyIndices[e];
		if (t !== void 0) return this._arr[t].priority;
	}
	min() {
		if (this.size() === 0) throw Error("Queue underflow");
		return this._arr[0].key;
	}
	add(e, t) {
		let n = this._keyIndices, r = String(e);
		if (!(r in n)) {
			let e = this._arr, i = e.length;
			return n[r] = i, e.push({
				key: r,
				priority: t
			}), this._decrease(i), !0;
		}
		return !1;
	}
	removeMin() {
		if (this.size() === 0) throw Error("Queue underflow");
		this._swap(0, this._arr.length - 1);
		let e = this._arr.pop();
		return delete this._keyIndices[e.key], this._heapify(0), e.key;
	}
	decrease(e, t) {
		let n = this._keyIndices[e];
		if (n === void 0) throw Error(`Key not found: ${e}`);
		let r = this._arr[n].priority;
		if (t > r) throw Error(`New priority is greater than current priority. Key: ${e} Old: ${r} New: ${t}`);
		this._arr[n].priority = t, this._decrease(n);
	}
	_heapify(e) {
		let t = this._arr, n = 2 * e, r = n + 1, i = e;
		n < t.length && (i = t[n].priority < t[i].priority ? n : i, r < t.length && (i = t[r].priority < t[i].priority ? r : i), i !== e && (this._swap(e, i), this._heapify(i)));
	}
	_decrease(e) {
		let t = this._arr, n = t[e].priority, r;
		for (; e !== 0 && (r = e >> 1, !(t[r].priority < n));) this._swap(e, r), e = r;
	}
	_swap(e, t) {
		let n = this._arr, r = this._keyIndices, i = n[e], a = n[t];
		n[e] = a, n[t] = i, r[a.key] = e, r[i.key] = t;
	}
}, A = () => 1;
function re(e, t, n, r) {
	return j(e, String(t), n || A, r || function(t) {
		return e.outEdges(t) ?? [];
	});
}
function j(e, t, n, r) {
	let i = {}, a = new k(), o, s, c = function(e) {
		let t = e.v === o ? e.w : e.v, r = i[t];
		if (!r) return;
		let c = n(e), l = s.distance + c;
		if (c < 0) throw Error("dijkstra does not allow negative edge weights. Bad edge: " + e + " Weight: " + c);
		l < r.distance && (r.distance = l, r.predecessor = o, a.decrease(t, l));
	};
	for (e.nodes().forEach(function(e) {
		let n = e === t ? 0 : Infinity;
		i[e] = {
			distance: n,
			predecessor: ""
		}, a.add(e, n);
	}); a.size() > 0;) {
		o = a.removeMin();
		let e = i[o];
		if (!e || e.distance === Infinity) break;
		s = e, r(o).forEach(c);
	}
	return i;
}
function M(e, t, n) {
	return e.nodes().reduce(function(r, i) {
		return r[i] = re(e, i, t, n), r;
	}, {});
}
function N(e) {
	let t = 0, n = [], r = {}, i = [];
	function a(o) {
		var s;
		let c = r[o] = {
			onStack: !0,
			lowlink: t,
			index: t++
		};
		if (n.push(o), (s = e.successors(o)) == null || s.forEach(function(e) {
			if (e in r) {
				let t = r[e];
				t != null && t.onStack && (c.lowlink = Math.min(c.lowlink, t.index));
			} else {
				a(e);
				let t = r[e];
				t && (c.lowlink = Math.min(c.lowlink, t.lowlink));
			}
		}), c.lowlink === c.index) {
			let e = [], t;
			do {
				t = n.pop();
				let i = r[t];
				i && (i.onStack = !1), e.push(t);
			} while (o !== t);
			i.push(e);
		}
	}
	return e.nodes().forEach(function(e) {
		e in r || a(e);
	}), i;
}
function ie(e) {
	return N(e).filter(function(t) {
		let n = t[0];
		return n ? t.length > 1 || t.length === 1 && (e.outEdges(n, n) ?? []).length > 0 : !1;
	});
}
var ae = () => 1;
function P(e, t, n) {
	return oe(e, t || ae, n || function(t) {
		return e.outEdges(t) ?? [];
	});
}
function oe(e, t, n) {
	let r = {}, i = e.nodes();
	return i.forEach(function(e) {
		let a = {};
		r[e] = a, a[e] = {
			distance: 0,
			predecessor: ""
		}, i.forEach(function(t) {
			e !== t && (a[t] = {
				distance: Infinity,
				predecessor: ""
			});
		}), n(e).forEach(function(n) {
			let r = n.v === e ? n.w : n.v, i = t(n);
			a[r] = {
				distance: i,
				predecessor: e
			};
		});
	}), i.forEach(function(e) {
		let t = r[e];
		t && i.forEach(function(n) {
			let a = r[n];
			a && i.forEach(function(n) {
				let r = a[e], i = t[n], o = a[n];
				if (r && i && o) {
					let e = r.distance + i.distance;
					e < o.distance && (o.distance = e, o.predecessor = i.predecessor);
				}
			});
		});
	}), r;
}
var F = class extends Error {
	constructor(e) {
		super(e), this.name = "CycleException";
	}
};
function se(e) {
	let t = {}, n = {}, r = [];
	function i(a) {
		var o;
		if (a in n) throw new F();
		a in t || (n[a] = !0, t[a] = !0, (o = e.predecessors(a)) == null || o.forEach(i), delete n[a], r.push(a));
	}
	if (e.sinks().forEach(i), Object.keys(t).length !== e.nodeCount()) throw new F();
	return r;
}
function I(e) {
	try {
		se(e);
	} catch (e) {
		if (e instanceof F) return !1;
		throw e;
	}
	return !0;
}
function ce(e, t, n, r, i) {
	Array.isArray(t) || (t = [t]);
	let a = ((t) => (e.isDirected() ? e.successors(t) : e.neighbors(t)) ?? []), o = {};
	return t.forEach(function(t) {
		if (!e.hasNode(t)) throw Error("Graph does not have node: " + t);
		i = le(e, t, n === "post", o, a, r, i);
	}), i;
}
function le(e, t, n, r, i, a, o) {
	return t in r || (r[t] = !0, n || (o = a(o, t)), i(t).forEach(function(t) {
		o = le(e, t, n, r, i, a, o);
	}), n && (o = a(o, t))), o;
}
function ue(e, t, n) {
	return ce(e, t, n, function(e, t) {
		return e.push(t), e;
	}, []);
}
function de(e, t) {
	return ue(e, t, "post");
}
function L(e, t) {
	return ue(e, t, "pre");
}
function fe(e, t) {
	var n;
	let r = new _(), i = {}, a = new k(), o;
	function s(e) {
		let n = e.v === o ? e.w : e.v, r = a.priority(n);
		if (r !== void 0) {
			let s = t(e);
			s < r && (i[n] = o, a.decrease(n, s));
		}
	}
	if (e.nodeCount() === 0) return r;
	e.nodes().forEach(function(e) {
		a.add(e, Infinity), r.setNode(e);
	});
	let c = e.nodes()[0];
	c !== void 0 && a.decrease(c, 0);
	let l = !1;
	for (; a.size() > 0;) {
		if (o = a.removeMin(), o in i) r.setEdge(o, i[o]);
		else {
			if (l) throw Error("Input graph is not connected: " + e);
			l = !0;
		}
		(n = e.nodeEdges(o)) == null || n.forEach(s);
	}
	return r;
}
function pe(e, t, n, r) {
	return me(e, t, n, r ?? ((t) => e.outEdges(t) ?? []));
}
function me(e, t, n, r) {
	if (n === void 0) return re(e, t, n, r);
	let i = !1, a = e.nodes();
	for (let o = 0; o < a.length; o++) {
		let s = a[o];
		if (s === void 0) continue;
		let c = r(s);
		for (let e = 0; e < c.length; e++) {
			let t = c[e];
			if (!t) continue;
			let r = t.v === s ? t.v : t.w;
			n({
				v: r,
				w: r === t.v ? t.w : t.v
			}) < 0 && (i = !0);
		}
		if (i) return te(e, t, n, r);
	}
	return re(e, t, n, r);
}
var he = _;
function ge(e) {
	let t = new he().setGraph(e.graph());
	return e.nodes().forEach((n) => t.setNode(n, e.node(n))), e.edges().forEach((n) => {
		let r = t.edge(n.v, n.w) || {
			weight: 0,
			minlen: 1
		}, i = e.edge(n);
		t.setEdge(n.v, n.w, {
			weight: r.weight + i.weight,
			minlen: Math.max(r.minlen, i.minlen)
		});
	}), t;
}
function _e(e, t = ve) {
	let n = [];
	for (let r = 0; r < e.length; r += t) {
		let i = e.slice(r, r + t);
		n.push(i);
	}
	return n;
}
var ve = 65535;
function ye(e, t) {
	return t.length > ve ? e(..._e(t).map((t) => e(...t))) : e(...t);
}
function be(e) {
	let t = {};
	function n(r) {
		let i = e.node(r);
		if (Object.hasOwn(t, r)) return i.rank;
		t[r] = !0;
		let a = e.outEdges(r), o = a ? a.map((t) => t == null ? Infinity : n(t.w) - e.edge(t).minlen) : [], s = ye(Math.min, o);
		return s === Infinity && (s = 0), i.rank = s;
	}
	e.sources().forEach(n);
}
function xe(e, t) {
	return e.node(t.w).rank - e.node(t.v).rank - e.edge(t).minlen;
}
var Se = Ce;
function Ce(e) {
	let t = new he({ directed: !1 }), n = e.nodes();
	if (n.length === 0) throw Error("Graph must have at least one node");
	let r = n[0], i = e.nodeCount();
	t.setNode(r, {});
	let a, o;
	for (; we(t, e) < i && (a = Te(t, e), a);) o = t.hasNode(a.v) ? xe(e, a) : -xe(e, a), Ee(t, e, o);
	return t;
}
function we(e, t) {
	function n(r) {
		let i = t.nodeEdges(r);
		i && i.forEach((i) => {
			let a = i.v, o = r === a ? i.w : a;
			!e.hasNode(o) && !xe(t, i) && (e.setNode(o, {}), e.setEdge(r, o, {}), n(o));
		});
	}
	return e.nodes().forEach(n), e.nodeCount();
}
function Te(e, t) {
	return t.edges().reduce((n, r) => {
		let i = Infinity;
		return e.hasNode(r.v) !== e.hasNode(r.w) && (i = xe(t, r)), i < n[0] ? [i, r] : n;
	}, [Infinity, null])[1];
}
function Ee(e, t, n) {
	e.nodes().forEach((e) => t.node(e).rank += n);
}
var { preorder: De, postorder: Oe } = D;
ke.initLowLimValues = Ne, ke.initCutValues = Ae, ke.calcCutValue = Me, ke.leaveEdge = Fe, ke.enterEdge = Ie, ke.exchangeEdges = Le;
function ke(e) {
	e = ge(e), be(e);
	let t = Se(e);
	Ne(t), Ae(t, e);
	let n, r;
	for (; n = Fe(t);) r = Ie(t, e, n), Le(t, e, n, r);
}
function Ae(e, t) {
	let n = Oe(e, e.nodes());
	n = n.slice(0, n.length - 1), n.forEach((n) => je(e, t, n));
}
function je(e, t, n) {
	let r = e.node(n).parent, i = e.edge(n, r);
	i.cutvalue = Me(e, t, n);
}
function Me(e, t, n) {
	let r = e.node(n).parent, i = !0, a = t.edge(n, r), o = 0;
	a ||= (i = !1, t.edge(r, n)), o = a.weight;
	let s = t.nodeEdges(n);
	return s && s.forEach((a) => {
		let s = a.v === n, c = s ? a.w : a.v;
		if (c !== r) {
			let r = s === i, l = t.edge(a).weight;
			if (o += r ? l : -l, ze(e, n, c)) {
				let t = e.edge(n, c).cutvalue;
				o += r ? -t : t;
			}
		}
	}), o;
}
function Ne(e, t) {
	arguments.length < 2 && (t = e.nodes()[0]), Pe(e, {}, 1, t);
}
function Pe(e, t, n, r, i) {
	let a = n, o = e.node(r);
	t[r] = !0;
	let s = e.neighbors(r);
	return s && s.forEach((i) => {
		Object.hasOwn(t, i) || (n = Pe(e, t, n, i, r));
	}), o.low = a, o.lim = n++, i ? o.parent = i : delete o.parent, n;
}
function Fe(e) {
	return e.edges().find((t) => e.edge(t).cutvalue < 0);
}
function Ie(e, t, n) {
	let r = n.v, i = n.w;
	t.hasEdge(r, i) || (r = n.w, i = n.v);
	let a = e.node(r), o = e.node(i), s = a, c = !1;
	return a.lim > o.lim && (s = o, c = !0), t.edges().filter((t) => c === Be(e, e.node(t.v), s) && c !== Be(e, e.node(t.w), s)).reduce((e, n) => xe(t, n) < xe(t, e) ? n : e);
}
function Le(e, t, n, r) {
	let i = n.v, a = n.w;
	e.removeEdge(i, a), e.setEdge(r.v, r.w, {}), Ne(e), Ae(e, t), Re(e, t);
}
function Re(e, t) {
	let n = e.nodes().find((t) => !e.node(t).parent);
	if (!n) return;
	let r = De(e, [n]);
	r = r.slice(1), r.forEach((n) => {
		let r = e.node(n).parent, i = t.edge(n, r), a = !1;
		i || (i = t.edge(r, n), a = !0), t.node(n).rank = t.node(r).rank + (a ? i.minlen : -i.minlen);
	});
}
function ze(e, t, n) {
	return e.hasEdge(t, n);
}
function Be(e, t, n) {
	return n.low <= t.lim && t.lim <= n.lim;
}
//#endregion
//#region src/core/dataImport.js
function Ve(e) {
	return {
		id: e.id,
		parentId: e.parentId || "",
		type: e.type || "position",
		label: e.label || "",
		personName: e.personName || "",
		status: e.status || "",
		width: e.width || s.width,
		height: e.height || s.height,
		collapsed: !!e.collapsed,
		layoutMode: e.layoutMode || null,
		data: e.data || {}
	};
}
function He(e) {
	let t = [e.firstname, e.lastname].filter(Boolean).join(" ").trim();
	return e.status === "VACANT" ? "— VACANT —" : e.status === "UNFUNDED" ? t || "— UNFUNDED —" : t || "—";
}
function Ue(e) {
	let t = [];
	function n(e, r) {
		let i = "org-" + (e.org_id == null ? e.id : e.org_id);
		t.push({
			id: i,
			parentId: r,
			type: "department",
			label: e.name || e.label || "UNIT",
			width: o.width,
			height: o.height,
			data: { level: e.level }
		});
		let a = (e.positions || []).slice().sort((e, t) => (e.org_order || 0) - (t.org_order || 0));
		for (let e of a) t.push({
			id: "pos-" + e.id,
			parentId: i,
			type: "position",
			label: e.position_title || "POSITION",
			personName: He(e),
			status: e.status || "",
			width: s.width,
			height: s.height,
			data: { photo_url: e.photo_url || e.photo || null }
		});
		let c = (e.children || []).slice().sort((e, t) => (e.sort_order || 0) - (t.sort_order || 0));
		for (let e of c) n(e, i);
	}
	for (let t of e) n(t, "");
	return t;
}
function We(e) {
	let t = [], n = 0;
	function r(e, i) {
		let a = "mo-" + n++;
		if (e.type === "organization") t.push({
			id: a,
			parentId: i,
			type: "department",
			label: e.name || "UNIT",
			width: o.width,
			height: o.height,
			data: {
				is_head: !!e.is_head,
				level: e.meta && e.meta.level,
				srcId: e.id
			}
		});
		else {
			let n = e.type === "vacant";
			t.push({
				id: a,
				parentId: i,
				type: "position",
				label: e.position || "POSITION",
				personName: n ? "— VACANT —" : e.name || "—",
				status: n ? "VACANT" : "FILLED",
				width: s.width,
				height: s.height,
				data: {
					is_head: !!e.is_head,
					photo_url: e.photo_url || null,
					srcId: e.id
				}
			});
		}
		let c = (e.children || []).slice().sort((e, t) => (e.meta && e.meta.sort_order || 0) - (t.meta && t.meta.sort_order || 0));
		for (let e of c) r(e, a);
	}
	for (let t of e) r(t, "");
	return t;
}
function Ge(e) {
	return e.some((e) => e && !("parentId" in e) && (e.type === "organization" || e.type === "filled" || e.type === "vacant" || Array.isArray(e.children) && ("position" in e || "photo_url" in e)));
}
function Ke(e) {
	let t, n = null;
	if (Array.isArray(e)) t = e.length && Ge(e) ? We(e) : e;
	else if (e && Array.isArray(e.nodes)) t = e.nodes, n = e;
	else if (e && Array.isArray(e.tree)) t = Ue(e.tree);
	else if (e && e.tree && typeof e.tree == "object") t = Ue([e.tree]);
	else if (e && e.org_id != null) t = Ue([e]);
	else if (e && Array.isArray(e.children) && e.type) t = We([e]);
	else throw Error("Unrecognized JSON. Expected a flat node array, {nodes:[…]}, {tree:[…]}, or an API tree of {type,children}.");
	if (!t.length) throw Error("No nodes found in data.");
	if (t.find((e) => !e || e.id == null)) throw Error("Every node needs an \"id\" field.");
	return {
		nodes: t,
		meta: n
	};
}
//#endregion
//#region src/core/connectorGeometry.js
var R = .001;
function z(e) {
	return Math.round(Number(e) * 1e3) / 1e3;
}
function B(e) {
	let t = z(e);
	return String(t);
}
function qe(e) {
	let t = String(e || "").match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi)?.map(Number) || [], n = [];
	for (let e = 0; e + 1 < t.length; e += 2) n.push({
		x: z(t[e]),
		y: z(t[e + 1])
	});
	return n;
}
function Je(e) {
	return e == null ? "" : typeof e == "object" ? JSON.stringify(Object.keys(e).sort().reduce((t, n) => (t[n] = e[n], t), {})) : String(e);
}
function Ye(e) {
	return [...e].map(String).sort().join("\0");
}
function V(e) {
	return `${B(e.x)},${B(e.y)}`;
}
function Xe(e) {
	return Math.abs(e.b.x - e.a.x) + Math.abs(e.b.y - e.a.y);
}
function Ze(e) {
	return e.map((e, t) => `${t ? "L" : "M"} ${B(e.x)} ${B(e.y)}`).join(" ");
}
function Qe(e) {
	let t = e.map((e) => {
		let t = Math.abs(e.a.y - e.b.y) < R;
		return {
			...e,
			horizontal: t,
			fixed: z(t ? e.a.y : e.a.x),
			start: z(Math.min(t ? e.a.x : e.a.y, t ? e.b.x : e.b.y)),
			end: z(Math.max(t ? e.a.x : e.a.y, t ? e.b.x : e.b.y)),
			styleKey: Je(e.style)
		};
	}).sort((e, t) => Number(e.horizontal) - Number(t.horizontal) || e.fixed - t.fixed || e.styleKey.localeCompare(t.styleKey) || e.start - t.start || e.end - t.end), n = [];
	for (let e of t) {
		let t = n.at(-1);
		if (t && t.horizontal === e.horizontal && Math.abs(t.fixed - e.fixed) < R && t.styleKey === e.styleKey && e.start <= t.end + R) {
			t.end = Math.max(t.end, e.end), t.memberIds = [.../* @__PURE__ */ new Set([...t.memberIds, ...e.memberIds])], t.shared = t.shared || e.shared;
			continue;
		}
		n.push({
			...e,
			memberIds: [...e.memberIds]
		});
	}
	return n.map((e) => {
		let t = e.horizontal ? {
			x: e.start,
			y: e.fixed
		} : {
			x: e.fixed,
			y: e.start
		}, n = e.horizontal ? {
			x: e.end,
			y: e.fixed
		} : {
			x: e.fixed,
			y: e.end
		};
		return {
			...e,
			a: t,
			b: n,
			d: `M ${B(t.x)} ${B(t.y)} L ${B(n.x)} ${B(n.y)}`
		};
	});
}
function $e(e, t = {}) {
	let n = (e || []).map((e, t) => typeof e == "string" ? {
		id: String(t),
		d: e,
		style: null
	} : {
		id: String(e.id ?? t),
		d: e.d,
		style: e.style ?? null
	}), r = /* @__PURE__ */ new Map();
	for (let e of n) {
		let t = qe(e.d);
		for (let n = 1; n < t.length; n += 1) {
			let i = t[n - 1], a = t[n], o = Math.abs(i.y - a.y) < R, s = Math.abs(i.x - a.x) < R;
			if (!o && !s) continue;
			let c = z(o ? i.y : i.x), l = z(Math.min(o ? i.x : i.y, o ? a.x : a.y)), u = z(Math.max(o ? i.x : i.y, o ? a.x : a.y));
			if (u - l < R) continue;
			let d = `${o ? "h" : "v"}:${c}`;
			r.has(d) || r.set(d, {
				horizontal: o,
				fixed: c,
				segments: []
			}), r.get(d).segments.push({
				start: l,
				end: u,
				entry: e
			});
		}
	}
	let i = t.styleKey || Je, a = [];
	for (let e of r.values()) {
		let n = [...new Set(e.segments.flatMap((e) => [e.start, e.end]))].sort((e, t) => e - t);
		for (let r = 1; r < n.length; r += 1) {
			let o = n[r - 1], s = n[r];
			if (s - o < R) continue;
			let c = e.segments.filter((e) => e.start <= o + R && e.end >= s - R);
			if (!c.length) continue;
			let l = [...new Map(c.map((e) => [e.entry.id, e.entry])).values()], u = l.length > 1, d = u ? t.sharedStyle ?? null : l[0].style;
			a.push({
				horizontal: e.horizontal,
				fixed: e.fixed,
				start: o,
				end: s,
				style: d,
				styleKey: i(d),
				shared: u,
				memberIds: l.map((e) => e.id)
			});
		}
	}
	a.sort((e, t) => Number(e.horizontal) - Number(t.horizontal) || e.fixed - t.fixed || e.start - t.start || e.end - t.end || e.styleKey.localeCompare(t.styleKey));
	let o = [];
	for (let e of a) {
		let n = o.at(-1);
		if (n && n.horizontal === e.horizontal && Math.abs(n.fixed - e.fixed) < R && Math.abs(n.end - e.start) < R && n.styleKey === e.styleKey && (!t.preserveMembership || Ye(n.memberIds) === Ye(e.memberIds))) {
			n.end = e.end, n.shared = n.shared || e.shared, n.memberIds = [.../* @__PURE__ */ new Set([...n.memberIds, ...e.memberIds])];
			continue;
		}
		o.push({ ...e });
	}
	return o.map((e) => {
		let t = e.horizontal ? {
			x: e.start,
			y: e.fixed
		} : {
			x: e.fixed,
			y: e.start
		}, n = e.horizontal ? {
			x: e.end,
			y: e.fixed
		} : {
			x: e.fixed,
			y: e.end
		};
		return {
			a: t,
			b: n,
			d: `M ${B(t.x)} ${B(t.y)} L ${B(n.x)} ${B(n.y)}`,
			style: e.style,
			shared: e.shared,
			memberIds: e.memberIds
		};
	});
}
function et(e, t, n = {}) {
	let r = (t || []).map((e, t) => {
		let n = String(e?.id ?? e?.childId ?? t), r = Array.isArray(e?.points) ? e.points.map((e) => ({
			x: z(e.x),
			y: z(e.y)
		})) : qe(e?.d ?? e);
		return {
			id: n,
			points: r,
			d: Ze(r),
			style: e?.style ?? null
		};
	}).filter((e) => e.points.length >= 2);
	if (r.length < 2) return null;
	let i = r.map((e) => e.id), a = Ye(i), o = r[0].points[0], s = $e(r, { preserveMembership: !0 }).map((t, n) => ({
		id: `${String(e)}:${n}`,
		a: t.a,
		b: t.b,
		d: t.d,
		childIds: [...t.memberIds].map(String).sort(),
		role: "branch"
	})), c = s.filter((e) => e.childIds.length > 1), l = c.filter((e) => Ye(e.childIds) === a), u = [], d = /* @__PURE__ */ new Set([V(o)]), f = !0;
	for (; f;) {
		f = !1;
		for (let e of l) {
			if (u.includes(e)) continue;
			let t = V(e.a), n = V(e.b);
			!d.has(t) && !d.has(n) || (u.push(e), d.add(t), d.add(n), f = !0);
		}
	}
	let p = !!n.horizontalFlow, m = u.filter((e) => Math.abs(e.a.y - e.b.y) < R === p), h = [...m.length ? m : u].sort((e, t) => Xe(t) - Xe(e))[0] || null, g = new Set(u.map((e) => e.id)), _ = new Set(u.flatMap((e) => [V(e.a), V(e.b)])), v = s.map((e) => {
		let t = Math.abs(e.a.y - e.b.y) < R;
		return {
			segment: e,
			horizontal: t,
			fixed: z(t ? e.a.y : e.a.x),
			start: z(Math.min(t ? e.a.x : e.a.y, t ? e.b.x : e.b.y)),
			end: z(Math.max(t ? e.a.x : e.a.y, t ? e.b.x : e.b.y))
		};
	}).filter((e) => e.horizontal !== p).sort((e, t) => Number(e.horizontal) - Number(t.horizontal) || e.fixed - t.fixed || e.start - t.start || e.end - t.end), y = [];
	for (let e of v) {
		let t = y.at(-1);
		if (t && t.horizontal === e.horizontal && Math.abs(t.fixed - e.fixed) < R && e.start <= t.end + R) {
			t.end = Math.max(t.end, e.end), t.segmentIds.push(e.segment.id), t.childIds = [.../* @__PURE__ */ new Set([...t.childIds, ...e.segment.childIds])].sort();
			continue;
		}
		y.push({
			horizontal: e.horizontal,
			fixed: e.fixed,
			start: e.start,
			end: e.end,
			segmentIds: [e.segment.id],
			childIds: [...e.segment.childIds]
		});
	}
	let b = y.filter((e) => {
		let t = e.horizontal ? {
			x: e.start,
			y: e.fixed
		} : {
			x: e.fixed,
			y: e.start
		}, n = e.horizontal ? {
			x: e.end,
			y: e.fixed
		} : {
			x: e.fixed,
			y: e.end
		};
		return e.childIds.length >= 2 || _.has(V(t)) || _.has(V(n));
	}).map((t, n) => {
		let r = t.horizontal ? {
			x: t.start,
			y: t.fixed
		} : {
			x: t.fixed,
			y: t.start
		}, i = t.horizontal ? {
			x: t.end,
			y: t.fixed
		} : {
			x: t.fixed,
			y: t.end
		};
		return {
			id: `${String(e)}:bus:${n}`,
			a: r,
			b: i,
			d: `M ${B(r.x)} ${B(r.y)} L ${B(i.x)} ${B(i.y)}`,
			childIds: t.childIds,
			segmentIds: t.segmentIds,
			role: "bus"
		};
	}), x = new Set(b.flatMap((e) => e.segmentIds));
	for (let e of s) g.has(e.id) ? e.role = "stem" : x.has(e.id) ? e.role = "bus" : e.childIds.length > 1 && (e.role = "shared");
	let S = [
		...u,
		...b,
		...c.filter((e) => !g.has(e.id) && !x.has(e.id))
	], C = i.map((e) => ({
		childId: e,
		segments: s.filter((t) => t.role === "branch" && t.childIds.length === 1 && t.childIds[0] === e)
	})), w = /* @__PURE__ */ new Map();
	for (let e of s) for (let t of [e.a, e.b]) {
		let n = V(t);
		w.has(n) || w.set(n, {
			point: t,
			segments: []
		}), w.get(n).segments.push(e.id);
	}
	let T = [...w.values()].filter((e) => e.segments.length >= 3).map((e) => ({
		point: e.point,
		segmentIds: e.segments
	}));
	return {
		model: "shared-family-network",
		parentId: String(e),
		childIds: i,
		source: o,
		segments: s,
		stemSegments: u,
		sharedSegments: S,
		buses: b,
		branches: C,
		junctions: T,
		trunk: h,
		horizontalFlow: p
	};
}
function tt(e, t = [], n = {}) {
	let r = (e || []).map((e, t) => typeof e == "string" ? {
		id: String(t),
		d: e,
		style: null
	} : {
		id: String(e.id ?? t),
		d: e.d,
		style: e.style ?? null
	}), i = new Map(r.map((e) => [e.id, e])), a = new Set([...n.rebuildFamilyIds || []].map(String)), o = [], s = /* @__PURE__ */ new Set(), c = [];
	for (let e of t || []) {
		let t = (e.childIds || []).map(String).filter((e) => i.has(e));
		if (t.length < 2) continue;
		let r = a.has(String(e.parentId)) || !Array.isArray(e.segments) || !e.segments.length ? et(e.parentId, t.map((e) => i.get(e)), { horizontalFlow: e.horizontalFlow }) : e;
		if (r) {
			o.push(r);
			for (let e of r.segments) {
				let t = e.childIds.map(String).filter((e) => i.has(e));
				if (!t.length) continue;
				t.forEach((e) => s.add(e));
				let r = e.role !== "branch", a = r ? n.sharedStyle ?? null : i.get(t[0])?.style ?? null;
				c.push({
					...e,
					d: e.d || `M ${B(e.a.x)} ${B(e.a.y)} L ${B(e.b.x)} ${B(e.b.y)}`,
					memberIds: t,
					shared: r,
					style: a
				});
			}
		}
	}
	let l = r.filter((e) => !s.has(e.id));
	return c.push(...$e(l, n)), {
		segments: Qe(c),
		familyNetworks: o,
		standaloneIds: l.map((e) => e.id)
	};
}
//#endregion
//#region src/core/layout.js
function H(e) {
	return e.orientation === "LeftToRight" || e.orientation === "RightToLeft";
}
function U(e, t) {
	return H(t) ? e.height : e.width;
}
function W(e, t) {
	return H(t) ? e.width : e.height;
}
function nt(e, t) {
	return e.isVirtual ? "Balanced" : e.layoutMode || t.subtreeMode;
}
function rt(e) {
	return e === "Alternate" || e === "AlternateLeft" || e === "AlternateRight";
}
function it(e) {
	return e === "Auto" || e === "AutoSmart" || e === "GridSmart";
}
function G(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
function at(e) {
	let t = !1, n = 0;
	for (let r of e.children) J(r) || (r.children.length === 0 ? t = !0 : n += 1);
	return n + +!!t;
}
function ot(e, t) {
	let n = at(e);
	return n <= 1 ? t : G(t / n ** .28, .88, Math.max(1.1, t));
}
function st(e, t, n) {
	if (t.subtreeMode !== "GridSmart" || n > 1 || e.node.isVirtual || t.visualTargetAspect < .8) return !1;
	let r = e.children.filter((e) => !J(e)), i = r.filter((e) => e.children.length > 0), a = r.filter((e) => e.children.length === 0);
	return i.length === 3 && (a.length > 0 || r.length < e.children.length);
}
function ct(e, t, n = t.targetAspect, r = 0) {
	let i = e.node, a = e.children, o = U(i, t), s = W(i, t);
	if (a.length === 0) return {
		w: o,
		h: s,
		anchorLeft: o / 2,
		anchorRight: o / 2,
		nodeCenterX: o / 2,
		nodeCenterY: s / 2,
		childPlacements: [],
		edgeRoutes: []
	};
	let c = nt(i, t), l = it(c) ? ot(e, n) : n, u = st(e, t, r), d = a.map((e) => ct(e, t, u && !J(e) && e.children.length === 2 && e.children.every((e) => e.children.length === 0) ? Math.max(1.15, l) : l, r + 1)), f = l;
	return it(c) ? Et(e, d, t, n, f, r) : rt(c) ? Ot(e, d, c, t) : Dt(e, d, c, t);
}
function lt(e, t, n, r, i) {
	let a = Math.max(.01, e / Math.max(1, t));
	return Math.abs(Math.log(a / n)) + Math.max(0, e * t - r) / Math.max(1, r) * .035 + i * .002;
}
function ut(e, t, n) {
	if (e.length <= 1) return n;
	let r = Math.max(...e.map((e) => e.cells.length)), i = Math.min(...e.map((e) => e.cells.length)), a = e.reduce((e, n) => e + (1 - n.w / Math.max(1, t)) ** 2, 0) / e.length, o = (r - i) / Math.max(1, r);
	return n + a * .18 + o * .16;
}
function dt(e, t, n, r, i = 1, a = !1, o = !1, s = .5) {
	if (!e.length) return {
		w: 0,
		h: 0,
		rows: [],
		columns: 0,
		placements: [],
		flow: "rows"
	};
	let c = null, l = e.reduce((e, t) => e + t.w * t.h, 0);
	for (let o = Math.min(e.length, Math.max(1, i)); o <= e.length; o += 1) {
		let i = e.length % o, u = a && i ? [o, i] : [o];
		for (let i of u) {
			let a = [], u = 0, d = i;
			for (; u < e.length;) {
				let t = e.slice(u, u + d), r = t.reduce((e, t) => e + t.w, 0) + n * Math.max(0, t.length - 1), i = Math.max(...t.map((e) => e.h));
				a.push({
					cells: t,
					w: r,
					h: i
				}), u += d, d = o;
			}
			let f = Math.max(...a.map((e) => e.cells.length)), p = Math.min(...a.map((e) => e.cells.length));
			if (a.length > 1 && p / f < s) continue;
			let m = Math.max(...a.map((e) => e.w)), h = a.reduce((e, t) => e + t.h, 0) + r * Math.max(0, a.length - 1), g = ut(a, m, lt(m, h, t, l, a.length));
			(!c || g < c.score - 1e-9 || Math.abs(g - c.score) < 1e-9 && o < c.columns) && (c = {
				w: m,
				h,
				rows: a,
				columns: o,
				score: g
			});
		}
	}
	if (o && e.length > 1 && e.length <= 12) {
		let i = 2 ** (e.length - 1);
		for (let a = 1; a < i; a += 1) {
			let i = [], o = [];
			e.forEach((t, n) => {
				o.push(t), (n === e.length - 1 || a & 1 << n) && (i.push(o), o = []);
			});
			let u = i.map((e) => ({
				cells: e,
				w: e.reduce((e, t) => e + t.w, 0) + n * Math.max(0, e.length - 1),
				h: Math.max(...e.map((e) => e.h))
			})), d = Math.max(...u.map((e) => e.cells.length)), f = Math.min(...u.map((e) => e.cells.length));
			if (u.length > 1 && f / d < s) continue;
			let p = Math.max(...u.map((e) => e.w)), m = u.reduce((e, t) => e + t.h, 0) + r * Math.max(0, u.length - 1), h = Math.max(...u.map((e) => e.cells.length)), g = ut(u, p, lt(p, m, t, l, u.length));
			g < c.score - 1e-9 && (c = {
				w: p,
				h: m,
				rows: u,
				columns: h,
				score: g
			});
		}
	}
	let u = 0, d = [];
	return c.rows.forEach((e, t) => {
		let i = (c.w - e.w) / 2;
		e.cells.forEach((r) => {
			d.push({
				item: r,
				x: i,
				y: u,
				row: t,
				rowHeight: e.h
			}), i += r.w + n;
		}), u += e.h + r;
	}), {
		...c,
		placements: d,
		flow: "rows"
	};
}
function ft(e, t, n, r) {
	if (!e.length) return {
		w: 0,
		h: 0,
		columns: [],
		placements: [],
		flow: "columns"
	};
	if (e.length > 12) return dt(e, t, n, r);
	let i = e.reduce((e, t) => e + t.w * t.h, 0), a = null, o = 2 ** Math.max(0, e.length - 1);
	for (let s = 0; s < o; s += 1) {
		let o = [], c = [];
		e.forEach((t, n) => {
			c.push(t), (n === e.length - 1 || s & 1 << n) && (o.push(c), c = []);
		});
		let l = o.map((e) => ({
			cells: e,
			w: Math.max(...e.map((e) => e.w)),
			h: e.reduce((e, t) => e + t.h, 0) + r * Math.max(0, e.length - 1)
		})), u = l.reduce((e, t) => e + t.w, 0) + n * Math.max(0, l.length - 1), d = Math.max(...l.map((e) => e.h)), f = lt(u, d, t, i, l.length);
		(!a || f < a.score - 1e-9 || Math.abs(f - a.score) < 1e-9 && l.length < a.columns.length) && (a = {
			w: u,
			h: d,
			columns: l,
			score: f
		});
	}
	let s = 0, c = [];
	return a.columns.forEach((e, t) => {
		let i = 0;
		e.cells.forEach((n) => {
			c.push({
				item: n,
				x: s + (e.w - n.w) / 2,
				y: i,
				column: t,
				columnWidth: e.w
			}), i += n.h + r;
		}), s += e.w + n;
	}), {
		...a,
		placements: c,
		flow: "columns"
	};
}
function pt(e, t, n, r) {
	if (!e.length) return {
		w: 0,
		h: 0,
		columns: [],
		placements: [],
		flow: "columns",
		packing: "masonry"
	};
	let i = e.reduce((e, t) => e + t.w * t.h, 0), a = null;
	for (let o = 1; o <= e.length; o += 1) {
		let s = Array.from({ length: o }, () => ({
			cells: [],
			w: 0,
			h: 0
		}));
		e.forEach((e, t) => {
			let n = t;
			if (t >= o) {
				n = 0;
				for (let e = 1; e < s.length; e += 1) s[e].h < s[n].h - 1e-9 && (n = e);
			}
			let i = s[n];
			i.cells.push(e), i.w = Math.max(i.w, e.w), i.h += e.h + (i.cells.length > 1 ? r : 0);
		});
		let c = s.reduce((e, t) => e + t.w, 0) + n * Math.max(0, s.length - 1), l = Math.max(...s.map((e) => e.h)), u = lt(c, l, t, i, s.length);
		(!a || u < a.score - 1e-9 || Math.abs(u - a.score) < 1e-9 && s.length < a.columns.length) && (a = {
			w: c,
			h: l,
			columns: s,
			score: u
		});
	}
	let o = 0, s = [];
	return a.columns.forEach((e, t) => {
		let i = 0;
		e.cells.forEach((n) => {
			s.push({
				item: n,
				x: o + (e.w - n.w) / 2,
				y: i,
				column: t,
				columnWidth: e.w
			}), i += n.h + r;
		}), o += e.w + n;
	}), {
		...a,
		placements: s,
		flow: "columns",
		packing: "masonry"
	};
}
function K(e, t) {
	return Math.ceil(e / t) * t;
}
function mt(e, t, n, r, i, a) {
	let o = r / 2, s = G(Math.min(t.x, n.x) - o, 0, i), c = G(Math.max(t.x, n.x) + o, 0, i), l = G(Math.min(t.y, n.y) - o, 0, a), u = G(Math.max(t.y, n.y) + o, 0, a);
	c - s > .01 && u - l > .01 && e.push({
		left: s,
		right: c,
		top: l,
		bottom: u,
		kind: "channel"
	});
}
function ht(e, t, n, r = 0, i = 0, a = []) {
	let o = U(e.node, n), s = e.node.isVirtual ? 0 : W(e.node, n);
	e.node.isVirtual || a.push({
		left: r + t.nodeCenterX - o / 2,
		right: r + t.nodeCenterX + o / 2,
		top: i + t.nodeCenterY - s / 2,
		bottom: i + t.nodeCenterY + s / 2,
		kind: "node"
	});
	let c = new Map((t.childPlacements || []).map((e) => [String(e.entry.node.id), e])), l = Math.max(4, n.gridSize * .32);
	for (let e of t.edgeRoutes || []) {
		let o = c.get(String(e.childId));
		if (!o) continue;
		let u = o.entry.node.isVirtual ? 0 : W(o.entry.node, n), d = {
			x: r + t.nodeCenterX,
			y: i + t.nodeCenterY + s / 2
		}, f = {
			x: r + o.cx + o.m.nodeCenterX,
			y: i + o.cy + o.m.nodeCenterY - u / 2
		}, p = (e.points || []).map((e) => ({
			x: r + e.x,
			y: i + e.y
		})), m = (d.y + f.y) / 2, h = p.length ? Z(kt([
			d,
			...p,
			f
		], !1)) : Z([
			d,
			{
				x: d.x,
				y: m
			},
			{
				x: f.x,
				y: m
			},
			f
		]);
		for (let e = 1; e < h.length; e += 1) mt(a, h[e - 1], h[e], l, r + t.w, i + t.h);
	}
	for (let e of t.childPlacements || []) ht(e.entry, e.m, n, r + e.cx, i + e.cy, a);
	return a;
}
function gt(e) {
	return e.footprint?.length ? e.footprint : [{
		left: 0,
		right: e.w,
		top: 0,
		bottom: e.h,
		kind: "node"
	}];
}
function _t(e, t, n, r, i) {
	if (e.kind === "node" && t.kind === "node") return {
		x: n,
		y: r
	};
	let a = Math.max(5, i * (e.kind === t.kind ? .28 : .48));
	return {
		x: a,
		y: a
	};
}
function vt(e, t) {
	let n = /* @__PURE__ */ new Map();
	return e.forEach((e, r) => {
		let i = Math.floor(e.left / t), a = Math.floor(e.right / t), o = Math.floor(e.top / t), s = Math.floor(e.bottom / t);
		for (let e = i; e <= a; e += 1) {
			let t = n.get(e);
			t || (t = /* @__PURE__ */ new Map(), n.set(e, t));
			for (let e = o; e <= s; e += 1) t.has(e) || t.set(e, []), t.get(e).push(r);
		}
	}), {
		rects: e,
		buckets: n,
		cellSize: t,
		seen: new Uint32Array(e.length),
		queryStamp: 0
	};
}
function yt(e, t, n, r, i, a, o) {
	let s = Math.max(i, a);
	for (let c of e) {
		let e = c.left + t, l = c.right + t, u = c.top + n, d = c.bottom + n, f = Math.floor((e - s) / r.cellSize), p = Math.floor((l + s) / r.cellSize), m = Math.floor((u - s) / r.cellSize), h = Math.floor((d + s) / r.cellSize);
		r.queryStamp >= 4294967294 ? (r.seen.fill(0), r.queryStamp = 1) : r.queryStamp += 1;
		let g = r.queryStamp;
		for (let t = f; t <= p; t += 1) {
			let n = r.buckets.get(t);
			if (n) for (let t = m; t <= h; t += 1) for (let s of n.get(t) || []) {
				if (r.seen[s] === g) continue;
				r.seen[s] = g;
				let t = r.rects[s], n = _t(c, t, i, a, o);
				if (!(l + n.x <= t.left + .01 || t.right + n.x <= e + .01 || d + n.y <= t.top + .01 || t.bottom + n.y <= u + .01)) return !1;
			}
		}
	}
	return !0;
}
function bt(e, t = 18) {
	let n = /* @__PURE__ */ new Set();
	for (let t of e) Number.isFinite(t) && t >= 0 && n.add(t);
	let r = [...n].sort((e, t) => e - t);
	if (r.length <= t) return r;
	let i = [];
	for (let e = 0; e < t; e += 1) i.push(r[Math.round(e * (r.length - 1) / (t - 1))]);
	return [...new Set(i)].sort((e, t) => e - t);
}
function xt(e, t, n, r, i) {
	if (!e.length) return {
		w: 0,
		h: 0,
		columns: [],
		rows: [],
		placements: [],
		flow: "columns",
		packing: "occupancy",
		score: 0
	};
	let a = Math.max(1, i), o = K(n, a), s = K(r, a), c = e.reduce((e, t) => e + gt(t).reduce((e, t) => e + (t.right - t.left) * (t.bottom - t.top), 0), 0), l = Math.max(...e.map((e) => e.w)), u = e.reduce((e, t) => e + t.w, 0) + o * Math.max(0, e.length - 1), d = Math.sqrt(Math.max(1, c) * Math.max(.2, t)), f = /* @__PURE__ */ new Set([K(l, a), K(u, a)]);
	for (let e of [
		.62,
		.76,
		.9,
		1,
		1.12,
		1.3,
		1.55,
		1.85
	]) f.add(K(Math.max(l, d * e), a));
	let p = 0;
	e.forEach((e, t) => {
		p += e.w + (t ? o : 0), f.add(K(Math.max(l, p), a));
	});
	let m = null;
	for (let n of [...f].sort((e, t) => e - t)) {
		let r = [];
		for (let t of e) {
			let e = gt(t), i = r.flatMap((e) => gt(e.item).map((t) => ({
				...t,
				left: t.left + e.x,
				right: t.right + e.x,
				top: t.top + e.y,
				bottom: t.bottom + e.y
			}))), c = vt(i, Math.max(64, o * 2, s * 1.2)), l = /* @__PURE__ */ new Set([0]), u = /* @__PURE__ */ new Set([0]);
			for (let e of r) l.add(K(e.x + e.item.w + o, a)), u.add(K(e.y + e.item.h + s, a));
			let d = new Set(i.map((e) => e.right)), f = new Set(i.map((e) => e.bottom)), p = new Set(e.map((e) => e.left)), m = new Set(e.map((e) => e.top));
			for (let e of d) for (let t of p) l.add(K(e + o - t, a));
			for (let e of f) for (let t of m) u.add(K(e + s - t, a));
			let h = null, g = bt(l), _ = bt(u);
			for (let r of _) {
				for (let i of g) if (!(i + t.w > n + .01) && yt(e, i, r, c, o, s, a)) {
					h = {
						item: t,
						x: i,
						y: r
					};
					break;
				}
				if (h) break;
			}
			let v = r.length ? K(Math.max(...r.map((e) => e.y + e.item.h)) + s, a) : 0;
			r.push(h || {
				item: t,
				x: 0,
				y: v
			});
		}
		let i = Math.max(...r.map((e) => e.x + e.item.w)), l = Math.max(...r.map((e) => e.y + e.item.h)), u = [...new Set(r.map((e) => e.y))].sort((e, t) => e - t), d = u.map((e) => {
			let t = r.filter((t) => t.y === e), n = Math.min(...t.map((e) => e.x)), i = Math.max(...t.map((e) => e.x + e.item.w));
			return {
				cells: t.map((e) => e.item),
				w: i - n,
				h: Math.max(...t.map((e) => e.item.h)),
				y: e
			};
		}), f = [...new Set(r.map((e) => e.x))].sort((e, t) => e - t).map((e, t) => {
			let n = r.filter((t) => t.x === e).sort((e, t) => e.y - t.y);
			for (let e of n) e.column = t, e.columnWidth = Math.max(...n.map((e) => e.item.w));
			return {
				cells: n.map((e) => e.item),
				w: Math.max(...n.map((e) => e.item.w)),
				h: Math.max(...n.map((e) => e.y + e.item.h)) - Math.min(...n.map((e) => e.y))
			};
		});
		d.forEach((e, t) => {
			r.filter((t) => t.y === e.y).forEach((n) => {
				n.row = t, n.rowHeight = e.h;
			});
		});
		let p = lt(i, l, t, c, u.length) + Math.max(0, n - i) / Math.max(1, i) * .01, h = {
			w: i,
			h: l,
			rows: d,
			columns: f,
			placements: r,
			score: p,
			flow: "columns",
			packing: "occupancy",
			mouldWidth: n
		};
		(!m || p < m.score - 1e-9 || Math.abs(p - m.score) < 1e-9 && l < m.h - .01 || Math.abs(p - m.score) < 1e-9 && Math.abs(l - m.h) < .01 && i < m.w) && (m = h);
	}
	return m;
}
function St(e, t, n = e.w / 2) {
	let r = (e.placements || []).map((e) => [e.x, e.x + e.item.w]).sort((e, t) => e[0] - t[0] || e[1] - t[1]);
	if (!r.length) return null;
	let i = [];
	for (let e of r) {
		let t = i[i.length - 1];
		!t || e[0] > t[1] + .01 ? i.push(e.slice()) : t[1] = Math.max(t[1], e[1]);
	}
	let a = [];
	for (let e = 1; e < i.length; e += 1) {
		let r = i[e - 1][1], o = i[e][0];
		o - r >= t && a.push({
			x: (r + o) / 2,
			distance: Math.abs((r + o) / 2 - n)
		});
	}
	return a.sort((e, t) => e.distance - t.distance || e.x - t.x), a[0]?.x ?? null;
}
function Ct(e, t, n = e.w / 2) {
	let r = e.placements || [], i = [...new Set(r.map((e) => e.y))].sort((e, t) => e - t);
	if (i.length < 2) return null;
	let a = r.filter((e) => Math.abs(e.y - i[0]) < .01).sort((e, t) => e.x - t.x), o = i.at(-1), s = [];
	for (let e = 1; e < a.length; e += 1) {
		let i = a[e - 1].x + a[e - 1].item.w, c = a[e].x;
		if (c - i < t) continue;
		let l = (i + c) / 2;
		r.some((e) => e.y < o - .01 && l > e.x + .01 && l < e.x + e.item.w - .01) || s.push({
			x: l,
			distance: Math.abs(l - n)
		});
	}
	return s.sort((e, t) => e.distance - t.distance || e.x - t.x), s[0]?.x ?? null;
}
function wt(e, t, n, r) {
	let i = St(e, r, t);
	if (i != null) return i;
	let a = e.placements || [], o = a.length ? Math.min(...a.map((e) => e.x)) : 0, s = a.length ? Math.max(...a.map((e) => e.x + e.item.w)) : e.w, c = o - n, l = s + n;
	return Math.abs(t - c) <= Math.abs(t - l) ? c : l;
}
function q(e, t) {
	let n = e[e.length - 1];
	(!n || Math.abs(n.x - t.x) > .01 || Math.abs(n.y - t.y) > .01) && e.push(t);
}
function J(e) {
	let t = e?.node?.data || {}, n = String(e?.node?.label || "");
	return t.printRole === "head" || t.is_head === !0 || t.isHead === !0 || /\b(municipal (vice )?mayor|office head|department head|head of office)\b/i.test(n);
}
function Tt(e) {
	let t = e.children.filter((e) => !J(e));
	return (t.length === 5 && t.length === e.children.length && t.every((e) => e.children.length === 0) ? 1 : 0) + e.children.reduce((e, t) => e + Tt(t), 0);
}
function Et(e, t, n, r, i, a) {
	let o = e.node, s = U(o, n), c = o.isVirtual ? 0 : W(o, n), l = n.spacingY * (n.autoSpacingYScale || 1), u = Math.max(12, n.spacingX), d = n.subtreeMode === "GridSmart" ? Math.max(n.gridSize * 2, l * .55) : Math.max(16, l * .55), f = o.isVirtual ? 0 : l, p = [], m = [], h = [];
	e.children.forEach((e, n) => {
		let r = {
			index: n,
			entry: e,
			m: t[n],
			w: t[n].w,
			h: t[n].h
		};
		J(e) ? p.push(r) : e.children.length === 0 ? m.push(r) : h.push(r);
	});
	let g = st(e, n, a), _ = n.subtreeMode === "GridSmart" && a <= 1 && !o.isVirtual && (h.length >= 4 || g), v = (n.leafFlow === "band" || _) && m.length > 0 && h.length > 0 && (r >= .8 || _), y = dt(m, v ? G(r * 1.8, 1.8, 5) : i, u, d, n.preferFiveLeafRank && n.visualTargetAspect >= .8 && p.length === 0 && h.length === 0 && m.length === 5 ? m.length : 1), b = dt(p, Math.max(1, r), u, d), x = [];
	if (m.length && !v) {
		let e = {
			kind: "leaves",
			w: y.w,
			h: y.h,
			pack: y
		};
		n.subtreeMode === "GridSmart" && (e.footprint = y.placements.flatMap((e) => ht(e.item.entry, e.item.m, n, e.x, e.y))), x.push(e);
	}
	h.forEach((e) => {
		let t = {
			kind: "branch",
			w: e.w,
			h: e.h,
			item: e
		};
		n.subtreeMode === "GridSmart" && (t.footprint = ht(e.entry, e.m, n)), x.push(t);
	});
	let S = u * 1.25, C = d * 1.25, w = dt(x, r, S, C, g ? x.length : 1, !!n.preferShortFirst, !!n.flexibleRows, _ && n.visualTargetAspect < 1.3 ? .75 : .5), T = x.some((e) => e.kind === "leaves"), E = n.blockFlow === "rows" || !T ? null : ft(x, r, S, C), D = n.blockFlow === "rows" || n.blockFlow === "columns" || !T ? null : pt(x, r, S, C), ee = n.subtreeMode === "GridSmart" ? xt(x, r, S, C, n.gridSize) : null, te = [
		w,
		E,
		D,
		ee
	].filter(Boolean).sort((e, t) => e.score - t.score || Number(e.flow === "columns") - Number(t.flow === "columns"))[0], ne = _ && (x.length >= 4 || g) && x.every((e) => e.kind === "branch"), O = n.subtreeMode === "GridSmart" ? ne ? w : ee : n.blockFlow === "columns" ? E || w : n.blockFlow === "masonry" ? D || w : n.blockFlow === "adaptive" ? te : w, k = g ? O.placements[Math.floor(O.placements.length / 2)] : null, A = k?.item.kind === "branch" ? k.x + k.item.item.m.nodeCenterX : null, re = A == null ? 0 : Math.max(A, O.w - A) * 2, j = Math.max(s, b.w, v ? y.w : 0, O.w, re), M = A == null ? (j - O.w) / 2 : j / 2 - A, N = j / 2;
	if (n.subtreeMode === "GridSmart" && p.length === 0 && h.length === 0 && m.length > 1 && y.rows.length > 1) {
		let e = O.placements.find((e) => e.item.kind === "leaves"), t = Ct(y, Math.max(8, u * .28), y.w / 2);
		if (e && t != null) {
			let n = M + e.x + t;
			n - s / 2 >= -.01 && n + s / 2 <= j + .01 && (N = n);
		}
	}
	let ie = c + f, ae = p.length ? ie + b.h + f : c + f, P = v ? ae + y.h + f : ae, oe = [], F = [], se = (j - b.w) / 2;
	for (let e of b.placements || []) oe.push({
		entry: e.item.entry,
		cx: se + e.x,
		cy: ie + e.y,
		m: e.item.m
	}), F.push({
		childId: e.item.entry.node.id,
		routeType: "bus"
	});
	let I = c + Math.max(10, f * .38), ce = se - u * .35, le = p.length ? ie + b.h + Math.max(10, f * .38) : I, ue = p.length ? [
		{
			x: N,
			y: I
		},
		{
			x: ce,
			y: I
		},
		{
			x: ce,
			y: le
		}
	] : [], de = p.length ? ue.slice() : [{
		x: N,
		y: I
	}], L = de;
	if (v) {
		let e = (j - y.w) / 2, t = de.at(-1).x, n = e + wt(y, t - e, u * .55, Math.max(8, u * .28)), r = de.at(-1).y;
		for (let t of y.placements) {
			let i = t.item, a = e + t.x, o = ae + t.y, s = a + i.m.nodeCenterX, c = o - Math.max(9, d * .34);
			oe.push({
				entry: i.entry,
				cx: a,
				cy: o,
				m: i.m
			}), F.push({
				childId: i.entry.node.id,
				routeType: "packed",
				points: [
					...de,
					{
						x: n,
						y: r
					},
					{
						x: n,
						y: c
					},
					{
						x: s,
						y: c
					}
				]
			});
		}
		L = [
			...de,
			{
				x: n,
				y: r
			},
			{
				x: n,
				y: P - Math.max(10, d * .34)
			}
		];
	}
	let fe = O.flow === "columns", pe = fe ? O.columns.some((e) => e.cells.length > 1) : O.rows.length > 1, me = /* @__PURE__ */ new Map();
	if (pe && !fe) {
		let e = L.slice(), t = e.at(-1).x, n = e.at(-1).y;
		for (let r = 0; r < O.rows.length; r += 1) {
			let i = O.placements.filter((e) => e.row === r);
			O.rows[r];
			let a = M + wt({
				w: O.w,
				placements: i
			}, N - M, u * .55, Math.max(8, u * .28)), o = P + (i[0]?.y || 0), s = r > 0 ? O.rows[r - 1] : null, c = r > 0 ? O.placements.filter((e) => e.row === r - 1) : [], l = s ? P + (c[0]?.y || 0) + s.h : n, f = r === 0 ? n : (l + o) / 2;
			q(e, {
				x: t,
				y: f
			}), q(e, {
				x: a,
				y: f
			});
			let p = o - Math.max(10, d * .34);
			q(e, {
				x: a,
				y: p
			});
			for (let t of i) me.set(t, e.slice());
			t = a, n = p;
		}
	}
	if (fe) {
		let e = O.placements.slice().sort((e, t) => e.y - t.y || e.x - t.x), t = L.slice(), n = t.at(-1).x, r = t.at(-1).y;
		for (let i of e) {
			let e = P + i.y, a = e + i.item.h, o = M + wt({
				w: O.w,
				placements: [i]
			}, N - M, u * .55, Math.max(8, u * .28));
			if (e >= r + Math.max(8, d * .18)) {
				let i = (r + e) / 2;
				q(t, {
					x: n,
					y: i
				}), q(t, {
					x: o,
					y: i
				});
			} else t = L.slice(), q(t, {
				x: o,
				y: t.at(-1).y
			});
			q(t, {
				x: o,
				y: e - Math.max(10, d * .34)
			}), me.set(i, t.slice()), n = o, r = Math.max(r, a);
		}
	}
	for (let e of O.placements || []) {
		let t = M + e.x, n = P + e.y, r = me.get(e);
		if (e.item.kind === "branch") {
			let i = e.item.item, a = t + i.m.nodeCenterX;
			oe.push({
				entry: i.entry,
				cx: t,
				cy: n,
				m: i.m
			}), F.push({
				childId: i.entry.node.id,
				routeType: "bus",
				points: r ? [...r, {
					x: a,
					y: n - Math.max(10, d * .34)
				}] : [...L, {
					x: a,
					y: L.at(-1).y
				}]
			});
			continue;
		}
		let i = e.item.pack, a = t + wt(i, (r ? r.at(-1).x : N) - t, u * .55, Math.max(8, u * .28));
		for (let e of i.placements) {
			let i = e.item, o = t + e.x, s = n + e.y, c = o + i.m.nodeCenterX, l = s - Math.max(9, d * .34), u = a;
			oe.push({
				entry: i.entry,
				cx: o,
				cy: s,
				m: i.m
			}), F.push({
				childId: i.entry.node.id,
				routeType: "packed",
				points: r ? [
					...r,
					{
						x: a,
						y: n - Math.max(10, d * .34)
					},
					{
						x: a,
						y: l
					},
					{
						x: c,
						y: l
					}
				] : [
					...p.length ? ue : [{
						x: N,
						y: I
					}],
					{
						x: u,
						y: p.length ? le : I
					},
					{
						x: u,
						y: l
					},
					{
						x: c,
						y: l
					}
				]
			});
		}
	}
	return {
		w: j,
		h: x.length ? P + O.h : ie + b.h,
		anchorLeft: N,
		anchorRight: j - N,
		nodeCenterX: N,
		nodeCenterY: c / 2,
		childPlacements: oe,
		edgeRoutes: F,
		resolvedMode: n.subtreeMode === "GridSmart" ? "GridSmart" : "AutoSmart"
	};
}
function Dt(e, t, n, r) {
	let i = e.node, a = U(i, r), o = i.isVirtual ? 0 : W(i, r), s = n === "Center" ? r.spacingX * .5 : r.spacingX, c = [], l = 0;
	for (let e = 0; e < t.length; e++) c.push(l), l += t[e].w + s;
	let u = l - s, d = c[0] + t[0].nodeCenterX, f = c[t.length - 1] + t[t.length - 1].nodeCenterX, p;
	switch (n) {
		case "Left":
			p = d;
			break;
		case "Right":
			p = f;
			break;
		default: p = (d + f) / 2;
	}
	let m = p + a / 2, h = Math.max(0, -(p - a / 2));
	for (let e = 0; e < c.length; e++) c[e] += h;
	p += h;
	let g = Math.max(u + h, m + h), _ = o + (i.isVirtual ? 0 : r.spacingY), v = Math.max(...t.map((e) => e.h)), y = [], b = [];
	for (let n = 0; n < t.length; n++) y.push({
		entry: e.children[n],
		cx: c[n],
		cy: _,
		m: t[n]
	}), b.push({
		childId: e.children[n].node.id,
		routeType: "bus"
	});
	return {
		w: g,
		h: _ + v,
		anchorLeft: p,
		anchorRight: g - p,
		nodeCenterX: p,
		nodeCenterY: o / 2,
		childPlacements: y,
		edgeRoutes: b
	};
}
function Ot(e, t, n, r) {
	let i = e.node, a = U(i, r), o = i.isVirtual ? 0 : W(i, r), s = n !== "AlternateRight", c = n === "Alternate", l = Math.max(16, r.spacingY * .45), u = o + (i.isVirtual ? 0 : r.spacingY), d = (t.length ? t[0].h : 0) / 2 + l / 2, f = u, p = u;
	s ? p += d : f += d;
	let m = [];
	for (let e = 0; e < t.length; e++) {
		let n = t[e], r;
		r = c ? Math.abs(f - p) < .01 ? s : f < p : s ? e % 2 == 0 : e % 2 == 1, r ? (m.push({
			i: e,
			side: -1,
			y: f,
			m: n
		}), f += n.h + l) : (m.push({
			i: e,
			side: 1,
			y: p,
			m: n
		}), p += n.h + l);
	}
	let h = (e) => m.filter((t) => t.side === e).reduce((e, t) => Math.max(e, t.m.w), 0), g = h(-1), _ = h(1), v = Math.max(g + 26, a / 2), y = [], b = [];
	for (let t of m) {
		let n = t.side < 0 ? v - 26 - t.m.w : v + 26;
		y[t.i] = {
			entry: e.children[t.i],
			cx: n,
			cy: t.y,
			m: t.m
		}, b[t.i] = {
			childId: e.children[t.i].node.id,
			routeType: t.side < 0 ? "spine-left" : "spine-right"
		};
	}
	let x = Math.max(f, p) - l, S = Math.max(v + 26 + _, v + a / 2);
	return {
		w: S,
		h: Math.max(x, u),
		anchorLeft: v,
		anchorRight: S - v,
		nodeCenterX: v,
		nodeCenterY: o / 2,
		childPlacements: y,
		edgeRoutes: b
	};
}
function Y(e) {
	let t = [];
	for (let n of e || []) {
		let e = {
			x: Number(n.x),
			y: Number(n.y)
		};
		if (!Number.isFinite(e.x) || !Number.isFinite(e.y)) continue;
		let r = t[t.length - 1];
		(!r || Math.abs(r.x - e.x) > .01 || Math.abs(r.y - e.y) > .01) && t.push(e);
	}
	return t;
}
function X(e, t, n) {
	if (!H(n)) {
		let n = t.cy >= e.cy;
		return {
			start: {
				x: e.cx,
				y: e.cy + (n ? e.node.height / 2 : -e.node.height / 2)
			},
			end: {
				x: t.cx,
				y: t.cy + (n ? -t.node.height / 2 : t.node.height / 2)
			}
		};
	}
	let r = t.cx >= e.cx;
	return {
		start: {
			x: e.cx + (r ? e.node.width / 2 : -e.node.width / 2),
			y: e.cy
		},
		end: {
			x: t.cx + (r ? -t.node.width / 2 : t.node.width / 2),
			y: t.cy
		}
	};
}
function kt(e, t) {
	let n = [e[0]];
	for (let r = 1; r < e.length; r += 1) {
		let i = n[n.length - 1], a = e[r];
		Math.abs(i.x - a.x) > .01 && Math.abs(i.y - a.y) > .01 && n.push(t ? {
			x: a.x,
			y: i.y
		} : {
			x: i.x,
			y: a.y
		}), n.push(a);
	}
	return Y(n);
}
function Z(e) {
	let t = Y(e), n = !0;
	for (; n && t.length > 2;) {
		n = !1;
		for (let e = 1; e < t.length - 1; e += 1) {
			let r = t[e - 1], i = t[e], a = t[e + 1], o = Math.abs(r.x - i.x) < .01 && Math.abs(i.x - a.x) < .01, s = Math.abs(r.y - i.y) < .01 && Math.abs(i.y - a.y) < .01;
			if (!(!o && !s)) {
				t.splice(e, 1), n = !0;
				break;
			}
		}
	}
	return Y(t);
}
function At(e, t) {
	let n = .01;
	return e.x > t.left + n && e.x < t.right - n && e.y > t.top + n && e.y < t.bottom - n;
}
function jt(e, t, n) {
	let r = .01;
	return Math.abs(e.x - t.x) < r ? e.x > n.left + r && e.x < n.right - r && Math.max(e.y, t.y) > n.top + r && Math.min(e.y, t.y) < n.bottom - r : Math.abs(e.y - t.y) < r ? e.y > n.top + r && e.y < n.bottom - r && Math.max(e.x, t.x) > n.left + r && Math.min(e.x, t.x) < n.right - r : !0;
}
function Mt(e, t) {
	for (let n = 1; n < e.length; n += 1) if (t.some((t) => jt(e[n - 1], e[n], t))) return !0;
	return !1;
}
var Nt = class {
	constructor() {
		this.items = [];
	}
	push(e) {
		let t = this.items;
		t.push(e);
		let n = t.length - 1;
		for (; n > 0;) {
			let r = Math.floor((n - 1) / 2);
			if (t[r].priority <= e.priority) break;
			t[n] = t[r], n = r;
		}
		t[n] = e;
	}
	pop() {
		let e = this.items;
		if (!e.length) return null;
		let t = e[0], n = e.pop();
		if (e.length) {
			let t = 0;
			for (;;) {
				let r = t * 2 + 1, i = r + 1;
				if (r >= e.length) break;
				let a = i < e.length && e[i].priority < e[r].priority ? i : r;
				if (e[a].priority >= n.priority) break;
				e[t] = e[a], t = a;
			}
			e[t] = n;
		}
		return t;
	}
};
function Pt(e, t, n, r, i = null) {
	let a = X(e, t, r), { start: o, end: s } = i || a, c = i?.reservedPaths || [], l = Math.max(6, Math.min(r.spacingX, r.spacingY) * .16), u = Math.max(10, Math.min(r.spacingX, r.spacingY) * .22), d = H(r), f = Math.abs(o.x - a.start.x) < .01 && Math.abs(o.y - a.start.y) < .01, p = Math.abs(s.x - a.end.x) < .01 && Math.abs(s.y - a.end.y) < .01, m = d ? a.end.x >= a.start.x ? 1 : -1 : a.end.y >= a.start.y ? 1 : -1, h = f ? d ? {
		x: o.x + m * u,
		y: o.y
	} : {
		x: o.x,
		y: o.y + m * u
	} : o, g = p ? d ? {
		x: s.x - m * u,
		y: s.y
	} : {
		x: s.x,
		y: s.y - m * u
	} : s, _ = n.map((n) => {
		let r = n.node.id === e.node.id || n.node.id === t.node.id ? 0 : l;
		return {
			left: n.cx - n.node.width / 2 - r,
			right: n.cx + n.node.width / 2 + r,
			top: n.cy - n.node.height / 2 - r,
			bottom: n.cy + n.node.height / 2 + r
		};
	}), v = [.../* @__PURE__ */ new Set([
		o.x,
		s.x,
		h.x,
		g.x,
		..._.flatMap((e) => [e.left, e.right])
	])].sort((e, t) => e - t), y = [.../* @__PURE__ */ new Set([
		o.y,
		s.y,
		h.y,
		g.y,
		..._.flatMap((e) => [e.top, e.bottom])
	])].sort((e, t) => e - t), b = v.indexOf(h.x), x = y.indexOf(h.y), S = v.indexOf(g.x), C = y.indexOf(g.y), w = (e, t, n) => `${e}:${t}:${n}`, T = new Nt(), E = /* @__PURE__ */ new Map(), D = /* @__PURE__ */ new Map(), ee = w(b, x, 0);
	E.set(ee, 0), T.push({
		x: b,
		y: x,
		direction: 0,
		cost: 0,
		priority: 0
	});
	let te = null, ne = Math.max(20, Math.min(r.spacingX, r.spacingY) * .6);
	for (; T.items.length;) {
		let e = T.pop(), t = w(e.x, e.y, e.direction);
		if (e.cost !== E.get(t)) continue;
		if (e.x === S && e.y === C) {
			te = t;
			break;
		}
		let n = [
			{
				x: e.x - 1,
				y: e.y,
				direction: 1
			},
			{
				x: e.x + 1,
				y: e.y,
				direction: 1
			},
			{
				x: e.x,
				y: e.y - 1,
				direction: 2
			},
			{
				x: e.x,
				y: e.y + 1,
				direction: 2
			}
		], r = {
			x: v[e.x],
			y: y[e.y]
		};
		for (let i of n) {
			if (i.x < 0 || i.x >= v.length || i.y < 0 || i.y >= y.length) continue;
			let n = {
				x: v[i.x],
				y: y[i.y]
			};
			if (_.some((e) => At(n, e) || jt(r, n, e)) || c.some((e) => {
				for (let t = 1; t < e.length; t += 1) if (Lt(r, n, e[t - 1], e[t]) || zt(r, n, e[t - 1], e[t])) return !0;
				return !1;
			})) continue;
			let a = Math.abs(n.x - r.x) + Math.abs(n.y - r.y), o = e.direction && e.direction !== i.direction ? ne : 0, s = e.cost + a + o, l = w(i.x, i.y, i.direction);
			if (s >= (E.get(l) ?? Infinity)) continue;
			E.set(l, s), D.set(l, t);
			let u = Math.abs(g.x - n.x) + Math.abs(g.y - n.y);
			T.push({
				...i,
				cost: s,
				priority: s + u
			});
		}
	}
	if (!te) return null;
	let O = [], k = te;
	for (; k;) {
		let [e, t] = k.split(":").map(Number);
		O.push({
			x: v[e],
			y: y[t]
		}), k = D.get(k);
	}
	O.reverse();
	let A = [];
	for (let e of O) {
		let t = A[A.length - 1], n = A[A.length - 2];
		n && t && (Math.abs(n.x - t.x) < .01 && Math.abs(t.x - e.x) < .01 || Math.abs(n.y - t.y) < .01 && Math.abs(t.y - e.y) < .01) ? A[A.length - 1] = e : A.push(e);
	}
	return Z([
		...f ? [o] : [],
		...A,
		...p ? [s] : []
	]);
}
function Ft(e, t) {
	let n = new Map(e.map((e) => [String(e.node.id), e]));
	for (let r of e) {
		if (!r.parentId) continue;
		let i = n.get(String(r.parentId));
		if (!i) continue;
		let { start: a, end: o } = X(i, r, t);
		if (!Mt(kt([
			a,
			...r.routePoints || [],
			o
		], H(t)), e.filter((e) => e.node.id !== i.node.id && e.node.id !== r.node.id).map((e) => ({
			left: e.cx - e.node.width / 2,
			right: e.cx + e.node.width / 2,
			top: e.cy - e.node.height / 2,
			bottom: e.cy + e.node.height / 2
		})))) continue;
		let s = Pt(i, r, e, t);
		s?.length > 2 && (r.routeType = "packed", r.routePoints = s.slice(1, -1));
	}
}
function It(e, t) {
	return {
		x: (e.x + t.x) / 2,
		y: (e.y + t.y) / 2
	};
}
function Lt(e, t, n, r) {
	let i = Math.abs(e.y - t.y) < .01;
	if (i === Math.abs(n.y - r.y) < .01) return !1;
	let a = i ? [e, t] : [n, r], o = i ? [n, r] : [e, t];
	return o[0].x > Math.min(a[0].x, a[1].x) + .01 && o[0].x < Math.max(a[0].x, a[1].x) - .01 && a[0].y > Math.min(o[0].y, o[1].y) + .01 && a[0].y < Math.max(o[0].y, o[1].y) - .01;
}
function Rt(e, t) {
	for (let n = 1; n < e.length; n += 1) for (let r = 1; r < t.length; r += 1) if (Lt(e[n - 1], e[n], t[r - 1], t[r])) return !0;
	return !1;
}
function zt(e, t, n, r) {
	let i = Math.abs(e.y - t.y) < .01;
	return i === Math.abs(n.y - r.y) < .01 ? i ? Math.abs(e.y - n.y) >= .01 ? !1 : Math.min(Math.max(e.x, t.x), Math.max(n.x, r.x)) - Math.max(Math.min(e.x, t.x), Math.min(n.x, r.x)) > .01 : Math.abs(e.x - n.x) >= .01 ? !1 : Math.min(Math.max(e.y, t.y), Math.max(n.y, r.y)) - Math.max(Math.min(e.y, t.y), Math.min(n.y, r.y)) > .01 : !1;
}
function Bt(e, t) {
	for (let n = 1; n < e.length; n += 1) for (let r = 1; r < t.length; r += 1) if (zt(e[n - 1], e[n], t[r - 1], t[r])) return !0;
	return !1;
}
function Vt(e, t) {
	let n = Math.min(e.length, t.length), r = [];
	for (let i = 0; i < n; i += 1) {
		let n = e[i];
		if (Math.abs(t[i].x - n.x) >= .01 || Math.abs(t[i].y - n.y) >= .01) break;
		r.push(n);
	}
	return Z(r);
}
function Ht(e) {
	let t = e.map((e) => ({
		child: e,
		points: Y(e.routePoints || [])
	})), n = /* @__PURE__ */ new Map();
	for (let e of t) {
		let r = e.points.slice(0, 1);
		for (let n of t) {
			if (n === e || !e.points.length || !n.points.length) continue;
			let t = Vt(e.points, n.points);
			t.length > r.length && (r = t);
		}
		n.set(String(e.child.node.id), r);
	}
	return n;
}
function Ut(e, t, n) {
	let r = e.routePoints;
	if (!r?.length) return;
	let i = X(t, e, n), a = H(n), o = Math.max(10, Math.min(n.spacingX, n.spacingY) * .22), s = Math.max(1, n.gridSize), c = r.at(-1);
	if (!a) {
		let e = i.end.y >= i.start.y, t = e ? i.end.y - o : i.end.y + o, n = e ? Math.floor(t / s) * s : Math.ceil(t / s) * s;
		if (e && c.y <= n || !e && c.y >= n) return;
		let a = c.y;
		for (let e = r.length - 1; e >= 0 && Math.abs(r[e].y - a) < .01; --e) r[e] = {
			...r[e],
			y: n
		};
		return;
	}
	let l = i.end.x >= i.start.x, u = l ? i.end.x - o : i.end.x + o, d = l ? Math.floor(u / s) * s : Math.ceil(u / s) * s;
	if (l && c.x <= d || !l && c.x >= d) return;
	let f = c.x;
	for (let e = r.length - 1; e >= 0 && Math.abs(r[e].x - f) < .01; --e) r[e] = {
		...r[e],
		x: d
	};
}
function Wt(e, t) {
	let n = new Map(e.map((e) => [String(e.node.id), e])), r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
	for (let a of e) {
		if (!a.parentId || !n.has(String(a.parentId))) continue;
		let e = String(a.parentId);
		r.has(e) || r.set(e, []), r.get(e).push(a);
		let o = n.get(e);
		Ut(a, o, t);
		let s = X(o, a, t);
		i.set(String(a.node.id), Z(kt([
			s.start,
			...a.routePoints || [],
			s.end
		], H(t))));
	}
	for (let [a, o] of r) {
		let r = n.get(a), s = Ht(o.filter((e) => !J({ node: e.node })));
		for (let n of o) {
			if (J({ node: n.node })) continue;
			let o = X(r, n, t), c = s.get(String(n.node.id)) || Y(n.routePoints || []).slice(0, 1), l = Pt(r, n, e, t, {
				start: c.at(-1) || o.start,
				end: o.end
			});
			if (!l || l.length < 2) continue;
			let u = Z(kt(Y([
				o.start,
				...c,
				...l.slice(1)
			]), H(t)));
			e.some((e) => {
				if (!e.parentId || String(e.parentId) === a || e.node.id === n.node.id) return !1;
				let t = i.get(String(e.node.id));
				return t ? Rt(u, t) || Bt(u, t) : !1;
			}) || (n.routeType = "packed", n.routePoints = u.length > 2 ? u.slice(1, -1) : [It(u[0], u[1])], i.set(String(n.node.id), u));
		}
	}
	for (let t of e) {
		let e = i.get(String(t.node.id));
		!e || e.length < 2 || J({ node: t.node }) || (t.routeType = "packed", t.routePoints = e.length > 2 ? e.slice(1, -1) : [It(e[0], e[1])]);
	}
	return Ft(e, t), Kt(e, t), Yt(e, t), sn(e, t);
}
function Gt(e, t, n) {
	let r = X(e, t, n);
	return Z(kt([
		r.start,
		...t.routePoints || [],
		r.end
	], H(n)));
}
function Kt(e, t) {
	let n = new Map(e.map((e) => [String(e.node.id), e])), r = e.map((e) => {
		let t = e.parentId == null ? null : n.get(String(e.parentId));
		return t ? {
			child: e,
			parent: t,
			parentId: String(e.parentId)
		} : null;
	}).filter(Boolean), i = /* @__PURE__ */ new Map();
	for (let e of r) i.set(e.parentId, (i.get(e.parentId) || 0) + 1);
	let a = (e) => {
		let t = 0, r = e, i = /* @__PURE__ */ new Set();
		for (; r?.parentId != null && !i.has(String(r.node.id));) i.add(String(r.node.id)), r = n.get(String(r.parentId)), t += 1;
		return t;
	}, o = (e) => Gt(e.parent, e.child, t), s = (e, t) => e.parentId !== t.parentId && (Rt(o(e), o(t)) || Bt(o(e), o(t))), c = Math.max(1, r.length * 2);
	for (let n = 0; n < c; n += 1) {
		let n = null;
		for (let e = 0; e < r.length && !n; e += 1) for (let t = e + 1; t < r.length; t += 1) if (s(r[e], r[t])) {
			n = [r[e], r[t]];
			break;
		}
		if (!n) return;
		let c = n.slice().sort((e, t) => {
			let n = i.has(String(e.child.node.id)) || e.child.node.type === "department", r = i.has(String(t.child.node.id)) || t.child.node.type === "department";
			return Number(n) - Number(r) || a(t.child) - a(e.child);
		}), l = !1;
		for (let n of c) {
			let i = r.filter((e) => e !== n && e.parentId !== n.parentId).map(o), a = X(n.parent, n.child, t), s = Pt(n.parent, n.child, e, t, {
				...a,
				reservedPaths: i
			});
			if (!s || s.length < 2) continue;
			let c = Z(s);
			if (!i.some((e) => Rt(c, e) || Bt(c, e))) {
				n.child.routeType = "packed", n.child.routePoints = c.length > 2 ? c.slice(1, -1) : [It(c[0], c[1])], l = !0;
				break;
			}
		}
		if (!l) return;
	}
}
function qt(e) {
	let t = 0;
	for (let n = 1; n < e.length; n += 1) t += Math.abs(e[n].x - e[n - 1].x) + Math.abs(e[n].y - e[n - 1].y);
	return t;
}
function Jt(e) {
	let t = 0;
	for (let n = 2; n < e.length; n += 1) Math.abs(e[n - 2].y - e[n - 1].y) < .01 != Math.abs(e[n - 1].y - e[n].y) < .01 && (t += 1);
	return t;
}
function Yt(e, t) {
	let n = new Map(e.map((e) => [String(e.node.id), e])), r = e.map((e) => {
		let t = e.parentId == null ? null : n.get(String(e.parentId));
		return t ? {
			child: e,
			parent: t,
			parentId: String(e.parentId)
		} : null;
	}).filter(Boolean), i = /* @__PURE__ */ new Map();
	for (let e of r) i.has(e.parentId) || i.set(e.parentId, []), i.get(e.parentId).push(e);
	let a = new Map(r.map((e) => [String(e.child.node.id), Gt(e.parent, e.child, t)])), o = H(t);
	for (let t of r) {
		if (J({ node: t.child.node })) continue;
		let n = String(t.child.node.id), s = a.get(n);
		if (!s || s.length < 3) continue;
		let c = 0;
		for (let e of i.get(t.parentId) || []) {
			if (e === t) continue;
			let n = Vt(s, a.get(String(e.child.node.id)) || []);
			c = Math.max(c, n.length - 1);
		}
		let l = e.filter((e) => e.node.id !== t.parent.node.id && e.node.id !== t.child.node.id).map((e) => ({
			left: e.cx - e.node.width / 2,
			right: e.cx + e.node.width / 2,
			top: e.cy - e.node.height / 2,
			bottom: e.cy + e.node.height / 2
		})), u = s.at(-1), d = qt(s), f = Jt(s), p = s, m = (e) => r.some((n) => {
			if (n === t || n.parentId === t.parentId) return !1;
			let r = a.get(String(n.child.node.id));
			return r && (Rt(e, r) || Bt(e, r));
		}), h = [s[0], u];
		(o ? Math.abs(h[0].y - h[1].y) < .01 : Math.abs(h[0].x - h[1].x) < .01) && !Mt(h, l) && !m(h) && (p = h);
		for (let e = c; e < s.length - 1; e += 1) {
			let t = s[e], n = o ? Math.abs(t.y - u.y) < .01 ? [t, u] : [
				t,
				{
					x: t.x,
					y: u.y
				},
				u
			] : Math.abs(t.x - u.x) < .01 ? [t, u] : [
				t,
				{
					x: u.x,
					y: t.y
				},
				u
			], r = Z([...s.slice(0, e), ...n]), i = qt(r), a = Jt(r), c = Math.abs(r[0].y - r[1].y) < .01, h = Math.abs(r.at(-2).y - r.at(-1).y) < .01;
			if (c !== o || h !== o || a > f || a === f && i >= d - .01 || Mt(r, l) || m(r)) continue;
			let g = qt(p), _ = Jt(p);
			(a < _ || a === _ && i < g - .01) && (p = r);
		}
		p !== s && (t.child.routeType = "packed", t.child.routePoints = p.length > 2 ? p.slice(1, -1) : [It(p[0], p[1])], a.set(n, p));
	}
}
function Q(e, t) {
	return t ? {
		cross: e.y,
		flow: e.x
	} : {
		cross: e.x,
		flow: e.y
	};
}
function Xt(e, t, n) {
	return n ? {
		x: t,
		y: e
	} : {
		x: e,
		y: t
	};
}
function Zt(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) for (let e = 1; e < n.length; e += 1) {
		let r = n[e - 1], i = n[e], a = Math.abs(r.y - i.y) < .01, o = a ? r.y : r.x, s = Math.min(a ? r.x : r.y, a ? i.x : i.y), c = Math.max(a ? r.x : r.y, a ? i.x : i.y);
		if (c - s < .01) continue;
		let l = `${a ? "h" : "v"}:${o.toFixed(3)}`;
		t.has(l) || t.set(l, []), t.get(l).push([s, c]);
	}
	let n = 0;
	for (let e of t.values()) {
		e.sort((e, t) => e[0] - t[0]);
		let [t, r] = e[0];
		for (let [i, a] of e.slice(1)) i <= r + .01 ? r = Math.max(r, a) : (n += r - t, t = i, r = a);
		n += r - t;
	}
	return n;
}
function Qt(e, t) {
	let n = e.reduce((e, t) => e + Jt(t), 0), r = Math.max(10, Math.min(t.spacingX, t.spacingY) * .22), i = e.reduce((e, t) => {
		if (t.length <= 2) return e;
		let n = t.at(-2), i = t.at(-1), a = Math.abs(n.x - i.x) + Math.abs(n.y - i.y);
		return e + Math.max(0, a - r);
	}, 0);
	return Zt(e) + n * Math.max(12, Math.min(t.spacingX, t.spacingY) * .45) + i;
}
function $t(e) {
	let t = e?.segments || [];
	for (let e = 0; e < t.length; e += 1) {
		let n = t[e], r = new Set((n.childIds || []).map(String));
		for (let i = e + 1; i < t.length; i += 1) {
			let e = t[i];
			if (!(e.childIds || []).some((e) => r.has(String(e))) && Lt(n.a, n.b, e.a, e.b)) {
				let t = Math.abs(n.a.y - n.b.y) < .01, r = t ? n : e;
				return {
					first: n,
					second: e,
					point: {
						x: (t ? e : n).a.x,
						y: r.a.y
					}
				};
			}
		}
	}
	return null;
}
function en(e, t, n, r) {
	return et(e, t.map((e, t) => ({
		id: String(e.node.id),
		points: n[t]
	})), { horizontalFlow: r });
}
function tn(e, t, n) {
	return Math.abs(t.y - n.y) < .01 ? Math.abs(e.y - t.y) < .01 && e.x >= Math.min(t.x, n.x) - .01 && e.x <= Math.max(t.x, n.x) + .01 : Math.abs(e.x - t.x) < .01 && e.y >= Math.min(t.y, n.y) - .01 && e.y <= Math.max(t.y, n.y) + .01;
}
function nn(e, t) {
	for (let n = 1; n < e.length; n += 1) if (tn(t, e[n - 1], e[n])) return {
		prefix: Y([...e.slice(0, n), t]),
		suffix: Y([t, ...e.slice(n)])
	};
	return null;
}
function rn(e, t) {
	return e && t && Math.abs(e.x - t.x) < .01 && Math.abs(e.y - t.y) < .01;
}
function an(e, t, n, r) {
	let i = n.map((e) => e.map((e) => ({ ...e }))), a = new Map(t.map((e, t) => [String(e.node.id), t])), o = Math.max(4, t.length * 3), s = en(e, t, i, r), c = !1;
	for (let n = 0; n < o; n += 1) {
		let n = $t(s);
		if (!n || !n.point) break;
		let o = n.first, l = n.second;
		(l.role === "bus" && o.role !== "bus" || l.role === o.role && (l.childIds?.length || 0) > (o.childIds?.length || 0)) && ([o, l] = [l, o]);
		let u = (o.childIds || []).map(String).find((e) => {
			let t = a.get(e);
			return t != null && nn(i[t], n.point);
		});
		if (!u) break;
		let d = nn(i[a.get(u)], n.point), f = !1;
		for (let e of (l.childIds || []).map(String)) {
			let t = a.get(e);
			if (t == null) continue;
			let r = nn(i[t], n.point);
			if (!r || !rn(d.prefix[0], r.prefix[0])) continue;
			let o = Z(Y([...d.prefix, ...r.suffix.slice(1)]));
			o.length < 2 || (i[t] = o, f = !0);
		}
		if (!f) break;
		c = !0, s = en(e, t, i, r);
	}
	return {
		paths: i,
		network: s,
		repaired: c
	};
}
function on(e, t, n, r) {
	let i = H(r), a = Q(X(e, t[0], r).start, i), o = Math.max(r.gridSize, Math.min(r.spacingX, r.spacingY) * .35), s = t.map((e) => {
		let t = Q({
			x: e.cx,
			y: e.cy
		}, i), n = i ? e.node.height / 2 : e.node.width / 2;
		return {
			min: t.cross - n,
			max: t.cross + n
		};
	}), c = [Math.min(...s.map((e) => e.min)) - o, Math.max(...s.map((e) => e.max)) + o], l = t.map((e) => Q({
		x: e.cx,
		y: e.cy
	}, i).flow), u = Math.min(a.flow, ...l), d = Math.max(a.flow, ...l);
	for (let r of n) {
		if (r.node.id === e.node.id || t.includes(r)) continue;
		let n = Q({
			x: r.cx,
			y: r.cy
		}, i), a = i ? r.node.width / 2 : r.node.height / 2;
		if (n.flow + a < u || n.flow - a > d) continue;
		let s = i ? r.node.height / 2 : r.node.width / 2;
		c.push(n.cross - s - o, n.cross + s + o);
	}
	let f = [...new Set(s.flatMap((e) => [e.min, e.max]))].sort((e, t) => e - t);
	for (let e = 1; e < f.length; e += 1) f[e] - f[e - 1] >= o * 1.4 && c.push((f[e] + f[e - 1]) / 2);
	for (let n of t) {
		let t = Gt(e, n, r);
		for (let e = 1; e < t.length; e += 1) {
			let n = Q(t[e - 1], i), r = Q(t[e], i);
			Math.abs(n.cross - r.cross) < .01 && Math.abs(n.flow - r.flow) > o && c.push(n.cross);
		}
	}
	let p = r.familyRouteOverrides?.[String(e.node.id)];
	Number.isFinite(Number(p?.trunkOffset)) && c.unshift(a.cross + Number(p.trunkOffset));
	let m = Math.max(1, r.gridSize);
	return [...new Set(c.map((e) => Math.round(e / m) * m))];
}
function sn(e, t) {
	let n = H(t), r = new Map(e.map((e) => [String(e.node.id), e])), i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), o = [];
	for (let n of e) {
		if (n.parentId == null) continue;
		let e = r.get(String(n.parentId));
		if (!e || (a.set(String(n.node.id), Gt(e, n, t)), J({ node: n.node }))) continue;
		let o = String(n.parentId);
		i.has(o) || i.set(o, {
			parent: e,
			children: []
		}), i.get(o).children.push(n);
	}
	let s = [...i.entries()].sort((e, t) => e[0].localeCompare(t[0]));
	for (let [i, c] of s) {
		if (c.children.length < 2) continue;
		let { parent: s, children: l } = c, u = l.map((e) => a.get(String(e.node.id))), d = {
			paths: u,
			score: Qt(u, t),
			generated: !1
		}, f = Q(X(s, l[0], t).start, n), p = l.map((e) => Q(X(s, e, t).end, n).flow).reduce((e, t) => e + Math.sign(t - f.flow), 0) >= 0 ? 1 : -1, m = Math.max(10, Math.min(t.spacingX, t.spacingY) * .22), h = f.flow + p * m, g = t.familyRouteOverrides?.[i];
		for (let o of on(s, l, e, t)) {
			let c = [], u = !0;
			for (let r of l) {
				let i = X(s, r, t), a = Q(i.start, n), l = Q(i.end, n), d = [i.start, i.end], f = e.filter((e) => e.node.id !== s.node.id && e.node.id !== r.node.id).map((e) => ({
					left: e.cx - e.node.width / 2,
					right: e.cx + e.node.width / 2,
					top: e.cy - e.node.height / 2,
					bottom: e.cy + e.node.height / 2
				}));
				if (Math.abs(a.cross - l.cross) < .01 && !Mt(d, f)) {
					c.push(d);
					continue;
				}
				let g = l.flow - p * m, _ = Z([
					i.start,
					Xt(a.cross, h, n),
					Xt(o, h, n),
					Xt(o, g, n),
					Xt(l.cross, g, n),
					i.end
				]);
				if (Mt(_, f)) {
					u = !1;
					break;
				}
				c.push(_);
			}
			if (!u || c.some((e) => [...a].some(([t, n]) => {
				let a = r.get(t);
				return a && String(a.parentId) !== i && (Rt(e, n) || Bt(e, n));
			}))) continue;
			let _ = Math.abs(o - f.cross) * 1.75, v = Qt(c, t) + _, y = Number.isFinite(Number(g?.trunkOffset)) ? Math.round((f.cross + Number(g.trunkOffset)) / Math.max(1, t.gridSize)) * Math.max(1, t.gridSize) : null, b = y != null && Math.abs(o - y) < .01;
			(b && !d.requested || b === !!d.requested && v < d.score - .01) && (d = {
				paths: c,
				score: v,
				generated: !0,
				requested: b
			});
		}
		let _ = an(i, l, d.paths, n);
		d.paths = _.paths, d.network = _.network, d.repaired = _.repaired, (d.generated || d.repaired) && l.forEach((e, t) => {
			let n = d.paths[t];
			e.routeType = "packed", e.routePoints = n.length > 2 ? n.slice(1, -1) : [It(n[0], n[1])], a.set(String(e.node.id), n);
		});
		let v = d.network || en(i, l, l.map((e) => a.get(String(e.node.id))), n);
		v && o.push(v);
	}
	return o;
}
function cn(e, t) {
	let n = new Map(e.map((e) => [String(e.node.id), e])), r = /* @__PURE__ */ new Map();
	for (let i of e) {
		if (i.parentId == null) continue;
		let e = n.get(String(i.parentId));
		if (!e) continue;
		let a = String(i.parentId);
		r.has(a) || r.set(a, []), r.get(a).push({
			childId: String(i.node.id),
			points: Gt(e, i, t)
		});
	}
	let i = [];
	for (let [e, n] of r) {
		let r = et(e, n.map((e) => ({
			id: e.childId,
			points: e.points
		})), { horizontalFlow: H(t) });
		r && i.push(r);
	}
	return i;
}
function ln(e, t) {
	let n = ct(e, t), r = [], i = Object.create(null);
	return (function e(n, a, o, s) {
		let c = n.node, l = o + a.nodeCenterX, u = s + a.nodeCenterY;
		if (!c.isVirtual) {
			let e = i[c.id] || {
				routeType: "bus",
				points: null
			};
			r.push({
				node: c,
				lx: l,
				ly: u,
				w: U(c, t),
				h: W(c, t),
				parentId: c.parentId,
				routeType: e.routeType,
				routePoints: e.points || null,
				resolvedLayoutMode: a.resolvedMode || nt(c, t)
			});
		}
		for (let e of a.edgeRoutes) i[e.childId] = {
			routeType: e.routeType,
			points: e.points ? e.points.map((e) => ({
				x: o + e.x,
				y: s + e.y
			})) : null
		};
		for (let t of a.childPlacements) e(t.entry, t.m, o + t.cx, s + t.cy);
	})(e, n, 0, 0), r;
}
function un(e) {
	let t = Infinity, n = Infinity, r = -Infinity, i = -Infinity;
	for (let a of e) t = Math.min(t, a.lx - a.w / 2), n = Math.min(n, a.ly - a.h / 2), r = Math.max(r, a.lx + a.w / 2), i = Math.max(i, a.ly + a.h / 2);
	return Number.isFinite(t) ? {
		w: r - t,
		h: i - n
	} : {
		w: 0,
		h: 0
	};
}
function dn(e) {
	let t = new Map(e.map((e) => [String(e.node.id), e])), n = /* @__PURE__ */ new Map();
	for (let t of e) {
		if (!t.parentId) continue;
		let e = String(t.parentId);
		n.has(e) || n.set(e, []), n.get(e).push(t);
	}
	let r = 0, i = 0, a = 0;
	for (let n of e) {
		if (!n.parentId) continue;
		let e = t.get(String(n.parentId));
		if (!e) continue;
		let o = Y([
			{
				x: e.lx,
				y: e.ly + e.h / 2
			},
			...n.routePoints || [],
			{
				x: n.lx,
				y: n.ly - n.h / 2
			}
		]), s = 0;
		for (let e = 1; e < o.length; e += 1) s += Math.abs(o[e].x - o[e - 1].x) + Math.abs(o[e].y - o[e - 1].y);
		let c = Math.abs(n.lx - e.lx) + Math.abs(n.ly - n.h / 2 - (e.ly + e.h / 2));
		i += Math.max(0, s / Math.max(1, c) - 1), a += Math.max(0, o.length - 2), r += 1;
	}
	let o = 0, s = 0, c = 0, l = 0;
	for (let e of n.values()) {
		let t = e.filter((e) => n.has(String(e.node.id)) || e.node.type === "department"), r = e.filter((e) => {
			if (t.includes(e)) return !1;
			let n = e.node.data || {};
			return n.printRole !== "head" && n.is_head !== !0 && n.isHead !== !0 && !/\b(municipal (vice )?mayor|office head|department head|head of office)\b/i.test(String(e.node.label || ""));
		});
		if (t.length && r.length) {
			let e = Math.max(...r.map((e) => e.ly + e.h / 2)), n = Math.min(...t.map((e) => e.ly - e.h / 2));
			c += +(n < e + 1), l += 1;
		}
		if (t.length < 2) continue;
		let i = [];
		for (let e of t.sort((e, t) => e.ly - t.ly)) i.some((t) => Math.abs(t - e.ly) < 1) || i.push(e.ly);
		o += (i.length - 1) / (t.length - 1), s += 1;
	}
	return {
		detourRatio: i / Math.max(1, r),
		bendsPerEdge: a / Math.max(1, r),
		rankScatter: o / Math.max(1, s),
		mixedBandPenalty: c / Math.max(1, l)
	};
}
function fn(e, t) {
	let n = t.subtreeMode === "GridSmart" ? [1, 1.8] : [
		.72,
		.84,
		.92,
		1,
		1.08,
		1.18,
		1.32,
		1.55,
		1.8
	], r = [
		.78,
		1,
		1.22
	], i = t.subtreeMode === "GridSmart" ? [{
		blockFlow: "occupancy",
		leafFlow: "inline",
		flexibleRows: !1,
		preferShortFirst: !1
	}, {
		blockFlow: "occupancy",
		leafFlow: "band",
		flexibleRows: !1,
		preferShortFirst: !1
	}] : [
		{
			blockFlow: "rows",
			leafFlow: "inline",
			flexibleRows: !1,
			preferShortFirst: !1
		},
		{
			blockFlow: "rows",
			leafFlow: "inline",
			flexibleRows: !1,
			preferShortFirst: !0
		},
		{
			blockFlow: "rows",
			leafFlow: "inline",
			flexibleRows: !0,
			preferShortFirst: !1
		},
		{
			blockFlow: "rows",
			leafFlow: "inline",
			flexibleRows: !0,
			preferShortFirst: !0
		},
		{
			blockFlow: "adaptive",
			leafFlow: "inline",
			flexibleRows: !1,
			preferShortFirst: !1
		},
		{
			blockFlow: "adaptive",
			leafFlow: "inline",
			flexibleRows: !0,
			preferShortFirst: !1
		},
		{
			blockFlow: "masonry",
			leafFlow: "inline",
			flexibleRows: !1,
			preferShortFirst: !1
		},
		{
			blockFlow: "columns",
			leafFlow: "inline",
			flexibleRows: !1,
			preferShortFirst: !1
		},
		{
			blockFlow: "rows",
			leafFlow: "band",
			flexibleRows: !0,
			preferShortFirst: !1
		},
		{
			blockFlow: "adaptive",
			leafFlow: "band",
			flexibleRows: !0,
			preferShortFirst: !1
		}
	], a = [], o = (n) => {
		for (let o of n) {
			let n = G(t.targetAspect * o, .2, 6);
			for (let s of r) for (let r of i) {
				let i = ln(e, {
					...t,
					targetAspect: n,
					autoSpacingYScale: s,
					...r
				}), c = un(i), l = c.w / Math.max(1, c.h), u = i.reduce((e, t) => e + t.w * t.h, 0), d = Math.max(1, c.w * c.h / Math.max(1, u)), f = Math.abs(Math.log(Math.max(.01, l) / t.targetAspect)), p = dn(i), m = Math.log(d) * .65 + p.detourRatio * .25 + p.bendsPerEdge * .02 + p.rankScatter * 1.4 + p.mixedBandPenalty * .9;
				a.push({
					positioned: i,
					shapePenalty: f,
					densityRatio: d,
					clarityScore: m,
					...p,
					...r,
					targetMultiplier: o,
					autoSpacingYScale: s
				});
			}
		}
	};
	o(n), t.subtreeMode === "GridSmart" && Math.min(...a.map((e) => e.shapePenalty)) > .08 && o([.72, 1.4]);
	let s = Math.min(...a.map((e) => e.shapePenalty)), c = t.subtreeMode === "GridSmart" ? Math.max(.08, s + .04) : Math.max(.05, s + .02), l = a.filter((e) => e.shapePenalty <= c);
	l.sort((e, t) => e.clarityScore - t.clarityScore || e.densityRatio - t.densityRatio || e.shapePenalty - t.shapePenalty || Math.abs(e.targetMultiplier - 1) - Math.abs(t.targetMultiplier - 1) || Math.abs(e.autoSpacingYScale - 1) - Math.abs(t.autoSpacingYScale - 1) || Number(e.blockFlow !== "rows") - Number(t.blockFlow !== "rows") || Number(e.flexibleRows) - Number(t.flexibleRows) || Number(e.preferShortFirst) - Number(t.preferShortFirst));
	let u = l[0];
	if (t.subtreeMode === "GridSmart" && t.visualTargetAspect >= .8 && Tt(e) === 1) {
		let n = ln(e, {
			...t,
			targetAspect: G(t.targetAspect * u.targetMultiplier, .2, 6),
			autoSpacingYScale: u.autoSpacingYScale,
			blockFlow: u.blockFlow,
			leafFlow: u.leafFlow,
			flexibleRows: u.flexibleRows,
			preferShortFirst: u.preferShortFirst,
			preferFiveLeafRank: !0
		}), r = un(u.positioned), i = un(n), a = i.w / Math.max(1, r.w), o = i.h / Math.max(1, r.h), s = i.w * i.h / Math.max(1, r.w * r.h);
		if (a <= 1.12 && o <= 1.12 && s <= 1.15) return n;
	}
	return u.positioned;
}
function pn(e, t, n) {
	let r = Object.create(null);
	for (let n of e) {
		let e = t[n.node.id] || 0;
		(r[e] || (r[e] = [])).push(n);
	}
	let i = Object.keys(r).map(Number).sort((e, t) => e - t), a = n.gridSize, o = 0;
	for (let e of i) {
		let t = r[e], i = Math.max(...t.map((e) => e.h));
		for (let e of t) e.ly = o + i / 2;
		let s = i + n.spacingY;
		n.alignGrid && (s = Math.ceil(s / a) * a), o += s;
	}
}
function mn(e, t, n) {
	switch (n.orientation) {
		case "BottomToTop": return {
			x: e,
			y: -t
		};
		case "LeftToRight": return {
			x: t,
			y: e
		};
		case "RightToLeft": return {
			x: -t,
			y: e
		};
		default: return {
			x: e,
			y: t
		};
	}
}
function hn(e = {}) {
	let t = e.orientation || "TopToBottom", n = e.subtreeMode || "AutoSmart", r = e.targetSize, i = (r && Number(r.width) > 0 && Number(r.height) > 0 ? Number(r.width) / Number(r.height) : null) || Number(e.targetAspect) || 1.6, a = t === "LeftToRight" || t === "RightToLeft" ? 1 / i : i;
	return {
		orientation: t,
		subtreeMode: n,
		spacingX: e.spacingX == null ? 40 : e.spacingX,
		spacingY: e.spacingY == null ? 70 : e.spacingY,
		gridSize: e.gridSize == null ? 22 : e.gridSize,
		alignGrid: e.alignGrid == null ? n === "GridSmart" : !!e.alignGrid,
		autoEdgeSide: !!e.autoEdgeSide,
		familyRouteOverrides: e.familyRouteOverrides || null,
		visualTargetAspect: i,
		targetAspect: Math.min(6, Math.max(.2, a))
	};
}
function gn(e, t = {}) {
	let n = hn(t), r = u(l((e || []).map(Ve))), i = it(n.subtreeMode) ? fn(r, n) : ln(r, n);
	n.subtreeMode === "Matrix" && pn(i, d(r), n);
	for (let e of i) {
		let t = mn(e.lx, e.ly, n);
		e.cx = t.x, e.cy = t.y, e.routePoints &&= e.routePoints.map((e) => mn(e.x, e.y, n));
	}
	let a = Infinity, o = Infinity;
	for (let e of i) a = Math.min(a, e.cx - e.node.width / 2), o = Math.min(o, e.cy - e.node.height / 2);
	isFinite(a) || (a = 0, o = 0);
	let s = 80 - a, c = 80 - o;
	for (let e of i) e.cx += s, e.cy += c, e.routePoints &&= e.routePoints.map((e) => ({
		x: e.x + s,
		y: e.y + c
	}));
	if (n.alignGrid) {
		let e = n.gridSize;
		for (let t of i) t.cx = Math.round(t.cx / e) * e, t.cy = Math.round(t.cy / e) * e, t.routePoints &&= t.routePoints.map((t) => ({
			x: Math.round(t.x / e) * e,
			y: Math.round(t.y / e) * e
		}));
	}
	let f = [];
	n.subtreeMode === "GridSmart" ? f = Wt(i, n) || [] : it(n.subtreeMode) && (Ft(i, n), f = cn(i, n));
	let p = Object.create(null);
	for (let e of i) p[e.node.id] = e;
	let m = _n(i);
	return {
		positioned: i,
		posById: p,
		cfg: n,
		bounds: m,
		framingBounds: vn(i, m, n),
		familyNetworks: f
	};
}
function _n(e) {
	let t = Infinity, n = Infinity, r = -Infinity, i = -Infinity;
	for (let a of e) t = Math.min(t, a.cx - a.node.width / 2), n = Math.min(n, a.cy - a.node.height / 2), r = Math.max(r, a.cx + a.node.width / 2), i = Math.max(i, a.cy + a.node.height / 2);
	return isFinite(t) ? {
		x: t,
		y: n,
		w: r - t,
		h: i - n
	} : {
		x: 0,
		y: 0,
		w: 0,
		h: 0
	};
}
function vn(e, t, n) {
	if (n.subtreeMode !== "GridSmart" || !e.length) return t;
	let r = new Map(e.map((e) => [String(e.node.id), e])), i = e.filter((e) => !e.parentId || !r.has(String(e.parentId)));
	if (i.length !== 1) return t;
	let a = i[0], o = new Set(e.filter((e) => e.parentId != null).map((e) => String(e.parentId))), s = e.filter((e) => String(e.parentId) === String(a.node.id)), c = s.filter((e) => !J({ node: e.node })), l = c.filter((e) => o.has(String(e.node.id))), u = c.filter((e) => !o.has(String(e.node.id)));
	if (l.length !== 3 || u.length === 0 && c.length === s.length) return t;
	let d = H(n), f = (e) => d ? e.cy : e.cx, p = (e) => d ? e.cx : e.cy;
	l.sort((e, t) => f(e) - f(t));
	let m = l[1], h = n.gridSize / 2 + .01;
	if (Math.abs(f(a) - f(m)) > h || l.some((e) => Math.abs(p(e) - p(m)) > h)) return t;
	let g = f(a);
	if (d) {
		let e = Math.max(g - t.y, t.y + t.h - g);
		return {
			...t,
			y: g - e,
			h: e * 2
		};
	}
	let _ = Math.max(g - t.x, t.x + t.w - g);
	return {
		...t,
		x: g - _,
		w: _ * 2
	};
}
//#endregion
//#region src/core/connectors.js
function $(e, t) {
	let n = t && t[e.node.id];
	return {
		x: e.cx + (n ? n.dx : 0),
		y: e.cy + (n ? n.dy : 0)
	};
}
function yn(e, t) {
	let n = e && t && t[e.node.id];
	return {
		dx: Number(n?.dx) || 0,
		dy: Number(n?.dy) || 0
	};
}
function bn(e, t, n, r) {
	let i = Array.isArray(t?.routePoints) ? t.routePoints : [];
	if (!i.length) return i;
	let a = yn(e, r), o = yn(t, r), s = {
		dx: o.dx - a.dx,
		dy: o.dy - a.dy
	}, c = i.map((e) => ({
		x: e.x + a.dx,
		y: e.y + a.dy
	})), l = c.length - 1, u = c[l], d = l;
	if (H(n)) {
		for (; d > 0 && Math.abs(c[d - 1].x - u.x) < .01;) --d;
		for (let e = d; e <= l; e += 1) c[e].x += s.dx;
		c[l].y += s.dy;
	} else {
		for (; d > 0 && Math.abs(c[d - 1].y - u.y) < .01;) --d;
		for (let e = d; e <= l; e += 1) c[e].y += s.dy;
		c[l].x += s.dx;
	}
	return c;
}
function xn(e, t, n, r, i, a) {
	let o = i && i[t.node.id], s = a && a[t.node.id];
	if (o && o.length || s) return Dn(e, t, o || [], n, r, s);
	if (t.routePoints && t.routePoints.length) return Dn(e, t, bn(e, t, n, r), n, r, null);
	let c = $(e, r), l = $(t, r), u = e.node.width, d = e.node.height, f = t.node.width, p = t.node.height, m = H(n), h = c.y - d / 2, g = c.y + d / 2, _ = c.x - u / 2, v = c.x + u / 2, y = l.y - p / 2, b = l.y + p / 2, x = l.x - f / 2, S = l.x + f / 2, C = [];
	if (t.routeType === "bus") {
		if (m) {
			let e = l.x >= c.x ? v : _, t = l.x >= c.x ? x : S, n = (e + t) / 2;
			C.push([e, c.y], [n, c.y], [n, l.y], [t, l.y]);
		} else {
			let e = l.y >= c.y ? g : h, t = l.y >= c.y ? y : b, n = (e + t) / 2;
			C.push([c.x, e], [c.x, n], [l.x, n], [l.x, t]);
		}
	} else if (m) {
		let e = l.x >= c.x ? v : _, t = l.y <= c.y ? b : y;
		C.push([e, c.y], [l.x, c.y], [l.x, t]);
	} else {
		let e = l.y >= c.y ? g : h, t = l.x <= c.x ? S : x;
		C.push([c.x, e], [c.x, l.y], [t, l.y]);
	}
	return "M " + C.map((e) => e[0].toFixed(1) + " " + e[1].toFixed(1)).join(" L ");
}
function Sn(e, t, n, r, i, a, o) {
	let s = $(e, a), c = $(t, a), l = e.node.width, u = e.node.height, d = t.node.width, f = t.node.height, p, m;
	return p = o && o.p ? {
		x: s.x + o.p.nx * l / 2,
		y: s.y + o.p.ny * u / 2
	} : H(i) ? {
		x: n.x >= s.x ? s.x + l / 2 : s.x - l / 2,
		y: s.y
	} : {
		x: s.x,
		y: n.y >= s.y ? s.y + u / 2 : s.y - u / 2
	}, m = o && o.c ? {
		x: c.x + o.c.nx * d / 2,
		y: c.y + o.c.ny * f / 2
	} : H(i) ? {
		x: r.x >= c.x ? c.x + d / 2 : c.x - d / 2,
		y: c.y
	} : {
		x: c.x,
		y: r.y >= c.y ? c.y + f / 2 : c.y - f / 2
	}, {
		S: p,
		E: m
	};
}
function Cn(e, t, n, r, i, a) {
	let o = Sn(e, t, n.length ? n[0] : $(t, i), n.length ? n[n.length - 1] : $(e, i), r, i, a), s = o.S, c = o.E;
	if (r.autoEdgeSide && n.length) a && a.p || (s = Tn(e, $(e, i), n[0])), a && a.c || (c = Tn(t, $(t, i), n[n.length - 1]));
	else if (!n.length && !(a && a.c) && t.routeType !== "bus") {
		let n = $(t, i), a = $(e, i), o = t.node.width, s = t.node.height;
		c = H(r) ? {
			x: n.x,
			y: n.y <= a.y ? n.y + s / 2 : n.y - s / 2
		} : {
			x: n.x <= a.x ? n.x + o / 2 : n.x - o / 2,
			y: n.y
		};
	}
	return [s].concat(n.map((e) => ({
		x: e.x,
		y: e.y
	})), [c]);
}
function wn(e, t, n, r, i, a) {
	return n || Array.isArray(t) && t.length ? t || [] : r && i ? bn(r, e, i, a) : Array.isArray(e?.routePoints) ? e.routePoints : [];
}
function Tn(e, t, n) {
	let r = e.node.width, i = e.node.height, a = n.x - t.x, o = n.y - t.y;
	return Math.abs(a) * i >= Math.abs(o) * r ? {
		x: t.x + (a >= 0 ? r / 2 : -r / 2),
		y: t.y
	} : {
		x: t.x,
		y: t.y + (o >= 0 ? i / 2 : -i / 2)
	};
}
function En(e, t) {
	let n = [e[0]];
	for (let r = 1; r < e.length; r++) {
		let i = n[n.length - 1], a = e[r];
		i.x !== a.x && i.y !== a.y && n.push(t ? {
			x: a.x,
			y: i.y
		} : {
			x: i.x,
			y: a.y
		}), n.push(a);
	}
	let r = !0;
	for (; r && n.length > 2;) {
		r = !1;
		for (let e = 1; e < n.length - 1; e += 1) {
			let t = n[e - 1], i = n[e], a = n[e + 1], o = Math.abs(t.x - i.x) < .01 && Math.abs(i.x - a.x) < .01, s = Math.abs(t.y - i.y) < .01 && Math.abs(i.y - a.y) < .01;
			if (!(!o && !s)) {
				n.splice(e, 1), r = !0;
				break;
			}
		}
	}
	return n.filter((e, t) => t === 0 || Math.abs(e.x - n[t - 1].x) > .01 || Math.abs(e.y - n[t - 1].y) > .01);
}
function Dn(e, t, n, r, i, a) {
	return "M " + En(Cn(e, t, n, r, i, a), H(r)).map((e) => e.x.toFixed(1) + " " + e.y.toFixed(1)).join(" L ");
}
//#endregion
//#region src/core/bounds.js
function On(e, t, n) {
	n ??= 0;
	let r = Infinity, i = Infinity, a = -Infinity, o = -Infinity;
	for (let n of e) {
		let e = $(n, t);
		r = Math.min(r, e.x - n.node.width / 2), i = Math.min(i, e.y - n.node.height / 2), a = Math.max(a, e.x + n.node.width / 2), o = Math.max(o, e.y + n.node.height / 2);
	}
	return isFinite(r) ? {
		x: r - n,
		y: i - n,
		w: a - r + n * 2,
		h: o - i + n * 2
	} : {
		x: 0,
		y: 0,
		w: 100,
		h: 100
	};
}
function kn(e, t, n, r = {}) {
	let i = r.maxZoom == null ? 1.4 : r.maxZoom, a = r.margin == null ? .92 : r.margin, o = e.w || 1, s = e.h || 1, c = Math.min(t / o, n / s, i) * a;
	return {
		zoom: c,
		panX: (t - o * c) / 2 - e.x * c,
		panY: (n - s * c) / 2 - e.y * c
	};
}
//#endregion
export { d as A, Ke as C, f as D, p as E, s as F, t as I, r as L, a as M, o as N, u as O, i as P, e as R, Ve as S, l as T, $e as _, Sn as a, Ue as b, xn as c, H as d, gn as f, et as g, hn as h, wn as i, n as j, c as k, Dn as l, U as m, kn as n, $ as o, W as p, Cn as r, En as s, On as t, mn as u, tt as v, He as w, Ge as x, We as y };
