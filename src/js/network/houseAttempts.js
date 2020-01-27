// const defaultKernel = getEmpty2DArray(9, 9, 0);
//   const c = 1;

//   const filters = [
//     [
//       [
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, -2, -2, -2, 0, -2, -2, -2, 0],
//         [0, -2, -2, -2, 0, -2, -2, -2, 0],
//       ],
//       defaultKernel.slice(),
//       [ // hor
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, -1, -1, -1, -1, -1, -1, -1, 0],
//         [0, -1, -1, -1, -1, -1, -1, -1, 0],
//         [0, 1, 1, 1, 1, 1, 1, 1, 0],
//         [0, -1, -1, -1, -1, -1, -1, -1, 0],
//         [0, -1, -1, -1, -1, -1, -1, -1, 0],
//       ],
//       defaultKernel.slice(),

//       defaultKernel.slice(),

//       [ // bottomright corner
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, -c, -c, -c, 0],
//         [0, 0, 0, 0, 0, -c, -c, -c, 0],
//         [0, 0, 0, 0, 0, c, c, c, 0],
//         [0, 0, 0, 0, 0, -c, -c, -c, 0],
//         [0, 0, 0, 0, 0, -c, -c, -c, 0],
//       ],
//       [ // bottomleft corner
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, -c, -c, -c, 0, 0, 0, 0, 0],
//         [0, -c, -c, -c, 0, 0, 0, 0, 0],
//         [0, c, c, c, 0, 0, 0, 0, 0],
//         [0, -c, -c, -c, 0, 0, 0, 0, 0],
//         [0, -c, -c, -c, 0, 0, 0, 0, 0],
//       ],

//       defaultKernel.slice(),
//       defaultKernel.slice(),
//     ],
//     [
//       [ // vert
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, -1, -1, 1, -1, -1],
//         [0, 0, 0, 0, -1, -1, 1, -1, -1],
//         [0, 0, 0, 0, -1, -1, 1, -1, -1],
//         [0, 0, 0, 0, -1, -1, 1, -1, -1],
//         [0, 0, 0, 0, -1, -1, 1, -1, -1],
//         [0, 0, 0, 0, -1, -1, 1, -1, -1],
//         [0, 0, 0, 0, -1, -1, 1, -1, -1],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//       ],
//       defaultKernel.slice(),
//       [
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, -2, -2],
//         [0, 0, 0, 0, 0, 0, 0, -2, -2],
//         [0, 0, 0, 0, 0, 0, 0, -2, -2],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//       ],
//       [
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, -2, -2],
//         [0, 0, 0, 0, 0, 0, 0, -2, -2],
//         [0, 0, 0, 0, 0, 0, 0, -2, -2],
//         [0, 0, 0, 0, 0, 0, 0, -2, -2],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//       ],

//       defaultKernel.slice(),

//       [ // bottomright corner
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, -c, -c, c, -c, -c],
//         [0, 0, 0, 0, -c, -c, c, -c, -c],
//         [0, 0, 0, 0, -c, -c, c, -c, -c],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//       ],
//       defaultKernel.slice(),

//       defaultKernel.slice(),
//       [
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, -c, -c, c, -c, -c],
//         [0, 0, 0, 0, -c, -c, c, -c, -c],
//         [0, 0, 0, 0, -c, -c, c, -c, -c],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//       ],
//     ],
//     [
//       [ // vert
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [-1, -1, 1, -1, -1, 0, 0, 0, 0],
//         [-1, -1, 1, -1, -1, 0, 0, 0, 0],
//         [-1, -1, 1, -1, -1, 0, 0, 0, 0],
//         [-1, -1, 1, -1, -1, 0, 0, 0, 0],
//         [-1, -1, 1, -1, -1, 0, 0, 0, 0],
//         [-1, -1, 1, -1, -1, 0, 0, 0, 0],
//         [-1, -1, 1, -1, -1, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//       ],
//       [
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [-2, -2, 0, 0, 0, 0, 0, 0, 0],
//         [-2, -2, 0, 0, 0, 0, 0, 0, 0],
//         [-2, -2, 0, 0, 0, 0, 0, 0, 0],
//         [-2, -2, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//       ],
//       [
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [-2, -2, 0, 0, 0, 0, 0, 0, 0],
//         [-2, -2, 0, 0, 0, 0, 0, 0, 0],
//         [-2, -2, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//       ],
//       defaultKernel.slice(),

//       defaultKernel.slice(),

//       defaultKernel.slice(),
//       [ // bottomright corner
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [-c, -c, c, -c, -c, 0, 0, 0, 0],
//         [-c, -c, c, -c, -c, 0, 0, 0, 0],
//         [-c, -c, c, -c, -c, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//       ],

//       [
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [-c, -c, c, -c, -c, 0, 0, 0, 0],
//         [-c, -c, c, -c, -c, 0, 0, 0, 0],
//         [-c, -c, c, -c, -c, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//       ],
//       defaultKernel.slice(),
//     ],
//     [
//       [
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, -2, -2, -2, 0, 0, 0, 0, 0],
//         [0, -2, -2, -2, 0, 0, 0, 0, 0],
//         [0, -2, -2, -2, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//       ],
//       [
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0,-1, 0.5, 1, 0.5,-1, 0, 0],
//         [0,-1, 0.5, 1, 0.5,-1, 0, 0, 0],
//         [-1, 0.5, 1, 0.5,-1, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//       ],
//       defaultKernel.slice(),
//       defaultKernel.slice(),

//       [
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0,-c, -c, 2, -c, -c, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//       ],

//       defaultKernel.slice(),
//       defaultKernel.slice(),

//       [
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         // [0, 0, -c, -c, c, -c, -c, 0, 0],
//         // [0, -c, -c, c, -c, -c, 0, 0, 0],
//         [-c, c, c, c, -c, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//       ],
//       defaultKernel.slice(),
//     ],
//     [
//       [
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, -2, -2, -2, 0],
//         [0, 0, 0, 0, 0, -2, -2, -2, 0],
//         [0, 0, 0, 0, 0, -2, -2, -2, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//       ],
//       defaultKernel.slice(),
//       defaultKernel.slice(),
//       [
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0,-1, 0.5, 1, 0.5,-1, 0, 0],
//         [0, 0, 0,-1, 0.5, 1, 0.5,-1, 0],
//         [0, 0, 0, 0,-1, 0.5, 1, 0.5,-1],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//       ],

//       [
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0,-c, -c, 2, -c, -c, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//       ],

//       defaultKernel.slice(),
//       defaultKernel.slice(),

//       defaultKernel.slice(),
//       [
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         // [0, 0, -c, -c, c, -c, -c, 0, 0],
//         // [0, 0, 0, -c, -c, c, -c, -c, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, -c, c, c, c, -c],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//       ],
//     ],
//   ];

//   const r = 1.5;
//   const filters1 = [
//     [
//       [
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 1, 1, 1, 0, 0, 0],
//         [0, 0, 0, 1, 1, 1, 0, 0, 0],
//         [0, 0, 0, 1, 1, 1, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//       ],
//       [
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 1, 1, 0, 0, 0],
//         [0, 0, 0, 0, 1, 1, 0, 0, 0],
//         [0, 0, 0, 0, 1, 1, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//       ],
//       [
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 1, 1, 0, 0, 0, 0],
//         [0, 0, 0, 1, 1, 0, 0, 0, 0],
//         [0, 0, 0, 1, 1, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//       ],
//       [
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, r, r, r, 0, 0, 0],
//         [0, 0, 0, r, r, r, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//       ],
//       [
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, r, r, r, 0, 0, 0],
//         [0, 0, 0, r, r, r, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0],
//       ],
//     ],
//     // [
//     //   defaultKernel.slice(),
//     //   defaultKernel.slice(),
//     //   defaultKernel.slice(),
//     //   [
//     //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     //     [0, 0, 0, 1, 1, 1, 0, 0, 0],
//     //     [0, 0, 0, 1, 1, 1, 0, 0, 0],
//     //     [0, 0, 0, 1, 1, 1, 0, 0, 0],
//     //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     //   ],
//     //   [
//     //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     //     [0, 0, 0, 1, 1, 1, 0, 0, 0],
//     //     [0, 0, 0, 1, 1, 1, 0, 0, 0],
//     //     [0, 0, 0, 1, 1, 1, 0, 0, 0],
//     //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     //   ],
//     // ],
//   ];

//   // const filters2 = [
//   //   [
//   //     [
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //     ],
//   //     [
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   //     ],
//   //   ],
//   // ];

//   const layers = [
//     {
//       type: 'maxPool2d',
//       poolSize: 6
//     },
//     {
//       type: 'conv2d',
//       filters
//     },
//     {
//       type: 'conv2d',
//       filters: filters1
//     },
//     // {
//     //   type: 'conv2d',
//     //   filters: filters2
//     // },
//   ];
