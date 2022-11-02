const { Random, MersenneTwister19937 } = require('random-js');
const random = new Random(MersenneTwister19937.autoSeed()); // uses the nativeMath engine

for (let i = 0; i < 10; i++) {
    console.log(random.bool(0.47));
}
