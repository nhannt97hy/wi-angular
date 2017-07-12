rm {plot,curve,depth-track,utils}.js
#browserify visualize-curve.js -o curve.js
#browserify visualize-depth-track.js -o depth-track.js
browserify visualize-plot.js -o plot.js
#cp {plot,curve,depth-track,visualize-utils}.js ../
