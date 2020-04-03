

// class Segment {
//   constructor(start, end) {
//     this.start = start;
//     this.end = end;
//     this.segmentGroups = [];
//   }

//   addSegmentGroup(group) {
//     this.segmentGroups.push(group);
//   }

//   removeSegmentGroup(group) {
//     const index = this.segmentGroups.indexOf(group);
//     if (index > -1) {
//       this.segmentGroups.splice(index, 1);
//     }
//   }
// }

// class SegmentGroup {
//   constructor(location) {
//     this.segments = [];
//     this.location = location;
//   }

//   removeRefs() {
//     // clean up the references to this segment group in its segments
//     this.segments.forEach(s => s.removeSegmentGroup(this));
//   }
// }

// class FilterRenderer {
//   constructor(acts, onAddSegment) {
//     this.settings = {
//       minThreshold: 10,
//       goodThreshold: 100,
//       boidPatience: 3,
//       attnPatience: 3,
//       erodeFrequency: 10000
//     };

//     this.acts = acts;
//     this.attn = null;
//     this.previousAttn = new Map();
//     this.prevAttnScore = 0;
//     this.segmentGroups = [];
//     this.onAddSegment = onAddSegment;
//     this.boidFails = 0;
//     this.attnFails = 0;
//     this.tester = new Tester();
//   }

//   isBoidStuck() {
//     return this.boidFails > this.settings.boidPatience;
//   }

//   isAttnStuck() {
//     return this.attnFails > this.settings.attnPatience;
//   }

//   run(t=0) {
//     const repeater = () => {
//       this.runOnce();
//       this.runTimer = setTimeout(() => {
//         repeater();
//       }, t);
//     }
//     repeater();
//   }

//   runOnce() {
//     if (this.isAttnStuck()) {
//       this.pickAttnLocation();
//     }

//     this.tryAddSegment();
//   }

//   pickAttnLocation() {
//     // pick top location from acts
//     let maxAct = -Infinity;
//     let location = null;
//     this.acts.tolist().forEach((row, y) => row.forEach((v, x) => {
//       // that is below threshold and not already focused on
//       if (v < this.settings.goodThreshold && !this.previousAttn.has(`${y},${x}`)) {
//         if (v > maxAct) {
//           location = { x, y };
//           maxAct = v;
//         }
//       }
//     }));

//     // update attention location and save score at that location for comparison
//     this.attn = location;
//     this.previousAttn.push(this.attn);
//     // set baseline score
//     this.prevAttnScore = this.getAttnScore();
//   }

//   getAttnScore() {
//     return this.acts.get(this.attn.y, this.attn.x);
//   }

//   tryAddSegment() {
//     let line;
//     if (this.isBoidStuck()) {
//       line = this.getNewLine();
//       this.attnFails += 1;
//     } else {
//       line = this.getMoreLine();
//       this.boidFails += 1;
//     }

//     const { segment, score } = line;

//     if (score > this.settings.minThreshold) {
//       this.segmentGroups.push(segment);
//       this.onAddSegment(segment);
//       this.boidFails = 0;
//       this.attnFails = 0;
//     }
//   }

//   getNewLine() {
//     this.tester.getNewLine()
//   }
// }

// class Filter {
//   constructor(acts, threshold, erodeFrequency, onAddSegment) {
//     this.acts = acts;
//     this.threshold = threshold;
//     this.previousAttn = new Map();
//     this.attn = null;
//     this.segmentGroups = [];
//     this.erodeFrequency = erodeFrequency;
//     this.onAddSegment = onAddSegment;

//     // const d0 = new Drawer(smartCanvasRef.current, pOverlayRef.current);
//     // d0.draw(5, 0, null, () => {});

//     this.draw();
//     this.startErodeTimer();
//   }

//   draw() {
//     const location = this.pickNextLocation();
//     if (location) {
//       // set attention of this filter at location
//       this.attn = location;
//       this.previousAttn.set(`${location.y},${location.x}`, 1);


//       // make a draw loop
//       // make a custom reward function that calcs improvements at location
//       let prevScore = this.acts.get(this.attn.y, this.attn.x);
//       const getScore = () => this.acts.get(this.attn.y, this.attn.x) - prevScore;
//       // record added segs in segGroup
//       const segmentGroup = [];

//       // bounds should be receptive field of this location for this kernel
//       const bounds = [];
//       // each iteration
//       setTimeout(() => this.drawLoop(), 0);
//     }
//   }

//   drawLoop() {
//     // get next seg (new line or continuing)
//     // lookup collisions -> add collision segs to this group
//     // add seg to this group and to call draw seg
//     const segment = new Segment(start, end);
//     segmentGroup.push(segment)
//     this.onAddSegment(segment);
//   }

//   pickNextLocation() {
//     // pick top location from acts
//     let maxAct = -Infinity;
//     let location = null;
//     this.acts.tolist().forEach((row, y) => row.forEach((v, x) => {
//       // that is below threshold and not already focused on
//       if (v < this.threshold && !this.previousAttn.has(`${y},${x}`)) {
//         if (v > maxAct) {
//           location = { x, y };
//           maxAct = v;
//         }
//       }
//     }));

//     return location;
//   }

//   startErodeTimer() {
//     this.erodeTimer = setTimeout(() => {
//       this.erode();
//       this.startErodeTimer();
//     }, this.erodeFrequency);
//   }

//   // remove lowest scoring segmentGroup
//   erode() {
//     // get current scores for segmentGroups
//     const scores = this.segmentGroup.map(g => {
//       const { location } = g;
//       const { x, y } = location;
//       const score = this.acts.get(y, x);
//       return score;
//     });
//     // add score to groups
//     const groupsAndScores = this.segmentGroup.map((g, i) => [g, scores[i]]);
//     // sort groups by score
//     groupsAndScores.sort((a, b) => {
//       return a[1] < b[1] ? -1 : 1;
//     });

//     // remove score from groups
//     const sortedGroups = groupsAndScores.map(g => g[0]);
//     // do garbage collection for lowest scoring group
//     sortedGroups[0].removeRefs();
//     // remove the first group (lowest scoring)
//     this.segmentGroup = sortedGroups.slice(1);
//   }
// }

// const layers = [
//   {
//     layerIndex: 1,
//     filterIndex: 0,
//     threshold: 1000,
//     erodeFrequency: 10000
//   },
//   {
//     layerIndex: 1,
//     filterIndex: 1,
//     threshold: 1000,
//     erodeFrequency: 10000
//   },
// ];

// class FadingCollage {
//   constructor(layers, smartCanvas) {
//     this.collisionTable = {};
//     this.allSegments = [];
//     this.smartCanvas = smartCanvas;
//     this.filters = [];

//     const arrs = this.smartCanvas.network.arrs;
//     this.filters = layers.forEach(layer => {
//       const { layerIndex, filterIndex, threshold, erodeFrequency } = layer;
//       const arr = arrs[layerIndex + 1].arr.slice(filterIndex);
//       const filter = new Filter(arr, threshold, erodeFrequency, this.addSegment);
//       return filter;
//     });
//   }

//   addSegment(segment) {
//     this.allSegments.push(segment);
//     const { start, end } = segment;
//     this.smartCanvas.addSegment(start, end);
//     this.smartCanvas.update();
//   }

//   // Occassionally redraw whole canvas with remaining segments
//   // drawAllSegments() {
//   //   // divide segments by if they are currently part of at least one group
//   //   const expired = [];
//   //   const current = [];
//   //   this.allSegments.filter(s => {
//   //     if (s.segmentGroups.length === 0) {
//   //       expired.push(s);
//   //     } else {
//   //       current.push(s);
//   //     }
//   //   });

//   //   // segments with no group should be erased
//   //   this.allSegments.forEach(s => {
//   //     const { start, end } = s;
//   //     this.smartCanvas.addSegment(start, end);
//   //   });
//   //   this.smartCanvas.forceFullUpdate();
//   // }
// }
