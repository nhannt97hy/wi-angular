let helper = require('./DialogHelper');
module.exports = function (ModalService, image, d3TrackCpnts, callback) {
    function ModalController ($scope, wiComponentService, close, $element, $timeout) {
        let self = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
        let currentImage = image;
        let tracks = d3TrackCpnts;

        let topDepth = currentImage.topDepth;
        let bottomDepth = currentImage.bottomDepth;
        let domElem;

        this.onReady = function() {
            domElem = d3.select($element[0]);
            $timeout(function() {
                let rect = domElem.select('img').node().getBoundingClientRect();
                let svg = domElem.select('.depth-axis')
                    .append('svg')
                        .attr('width', '100%')
                        .attr('height', rect.height);
                let ticks = prepareTicks();
                let shownTicks = ticks.filter(function(d) {
                    return d >= getWindowY()[0];
                })
                let axisScale = d3.scaleLinear()
                    .domain([topDepth, bottomDepth])
                    .range([0, rect.height]);
                let axis = d3.axisLeft(getTransformY())
                    .tickValues(shownTicks)
                    .tickFormat(function(d) {
                        return majorTest(ticks, d) ? getDecimalFormatter(1)(d) : '';
                    })
                    .tickSize(5);
                let axisGroup = svg.append('g')
                    .style('transform', 'translateX(90%)')
                    .call(axis);
                let svgImg = domElem.select('.image')
                    .append('svg')
                        .attr('width', rect.width)
                        .attr('height', rect.height)
                        .style('position', 'absolute')
                        .style('top', 0)
                        .style('left', 0);
                domElem.selectAll('line')
                    .style('stroke', '#000')
                    .style('stroke-opacity', 1);
                domElem.selectAll('text')
                    .style('font-weight', 'bold')
                    .style('font-size', '13px');
                svg.on('mousemove', function() {
                    drawTooltipImageView(svg.node(), svgImg.node());
                });
                svgImg.on('mousemove', function() {
                    drawTooltipImageView(svg.node(), svgImg.node());
                });
                let container = domElem.select('#image-view-container');
                container.on('mousewheel', function() {
                    drawTooltipImageView(svg.node(), svgImg.node());
                });
                container.on('mouseleave', function() {
                    removeTooltipImageView(svg.node(), svgImg.node());
                });
            }, 800);
        }

        this.currentImageUrl = currentImage.imageUrl;
        this.currentImageName = currentImage.name;

        this.onCancelButtonClicked = function () {
            close(null);
        };

        function drawTooltipImageView (domSvg, domSvgImg) {
            graph.createTooltipLines(domSvg);
            graph.createTooltipLines(domSvgImg);
            let y = d3.mouse(domSvgImg)[1];
            let depth = getTransformY().invert(y);
            tracks.forEach(tr => {
                let viTrack = tr.controller.viTrack;
                viTrack.drawTooltipLines(depth);
                viTrack.drawTooltipText(depth, true);
            });
        }

        function removeTooltipImageView (domSvg, domSvgImg) {
            graph.removeTooltipLines(domSvg);
            graph.removeTooltipLines(domSvgImg);
            tracks.forEach(tr => {
                let viTrack = tr.controller.viTrack;
                viTrack.removeTooltipLines();
                viTrack.removeTooltipText();
            });
        }

        function getTransformY () {
            return d3.scaleLinear()
                .domain(getWindowY())
                .range(getViewportY());
        }

        function getWindowY () {
            return [topDepth, bottomDepth];
        }

        function getViewportY () {
            let rect = domElem.select('img').node().getBoundingClientRect();
            return [0, rect.height];
        }

        function prepareTicks () {
            let windowY = getWindowY();
            let transformY = getTransformY();
            let utils = wiComponentService.getComponent(wiComponentService.UTILS);

            let inchStep = (transformY.invert(utils.getDpcm()) - windowY[0]) * 1.0;

            return d3.range(0, windowY[1], inchStep);
        }

        function getDecimalFormatter (decimal) {
            decimal = decimal < 0 ? 0 : decimal;
            return d3.format('.' + decimal + 'f');
        }

        function majorTest(ticks, d) {
            return ticks.indexOf(d) % 5 == 0;
        }
    }
    ModalService.showModal({
        templateUrl: "image-view-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function () {
            helper.removeBackdrop();
            callback();
        });
    });
}