$(document).ready(function () {
    let svg = d3.select('body')
    .append('svg')
    .append('g');
//---------- 建 立 繪 圖 區 塊-----------
    svg.append('g').attr('class', 'slices');
    svg.append('g').attr('class', 'labels');
    svg.append('g').attr('class', 'lines');

    let width = 960,
    height = 450,
    radius = Math.min(width, height) / 2;

    let pie = d3.pie()
    .sort(null)
    .value(function(d){ return d.value });

    let arc = d3.arc()
    .outerRadius(radius * 0.8)
    .innerRadius(radius * 0.4);

    let outerArc = d3.arc()
    .outerRadius(radius * 0.9)
    .innerRadius(radius * 0.9);

    svg.attr('transform', `translate(${width / 2},${height / 2})`);

    let key = (d) => d.data.label;

    let color = d3.scaleOrdinal()
      .domain(['Lorem ispim', 'dolor sit', 'amet', 'consectetur', 'adipisicing',
       'elit', 'sed', 'do', 'eiusmod', "tempor", "incididunt"])
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
    
    function randomData(){
        let labels = color.domain();
        return labels.map(function(label){
            return { label: label, value: Math.random() }
        });
    }

    change(randomData());

    d3.select('.randomize')
    .on( 'click', function(){ change(randomData()) });

    function change(data) {

        //-------------PIE SLICE-----------------
        //------------圓 餅 圖 分 割--------------

        let slice = svg.select('.slices').selectAll('path.slice')
        .data(pie(data), key);

        slice.enter()
        .insert('path')
        .style('fill',function(d){return color(d.data.label); })
        .attr('class', 'slice');

        slice.transition().duration(1000)
        .attrTween('d', function(d) {
            this._current = this._current || d;
            let interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t){
                return arc(interpolate(t));
                };
            })
        slice.exit().remove();

        //---------TEXT LABELS-----------
        //------文 字 資 料 輸 出---------
        let text = svg.select('.labels').selectAll('text').data(pie(data), key);
        //---圓 餅 圖 文 字 資 料 導 入-----
        text.enter()
        .append('text')
        .attr('dy','.35em')
        .text(function(d){return d.data.label;} );

        function midAngle(d){
              return d.startAngle + ( d.endAngle - d.startAngle ) / 2;
            }

         text.transition().duration(1000)
         .attrTween('transform',function(d) {
             this._current = this._current || d
            let interpolate = d3.interpolate(this._current, d);
            return function(t) {
                let d2 = interpolate(t);
                let pos = outerArc.centroid(d2);
                pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                return `translate(${pos})`;
            };
        }).styleTween('text-anchor', function(d) {
            this._current = this._current || d;
            let interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                let d2 = interpolate(t);
                return midAngle(d2) < Math.PI ? 'start':'end';
            };
        });
        text.exit().remove();
        //--------SLICE TO TEXT POLYLINES---------
        //-------以 下 控 制 文 字 引 導 線---------
        let polyline = svg.select('.lines').selectAll('polyline').data(pie(data), key);

        polyline.enter().append('polyline');

        polyline.transition().duration(1000)
            .attrTween('points',function(d) {
                this._current = this._current || d;
                let interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    let d2 = interpolate(t);
                    let pos = outerArc.centroid(d2);
                    pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                    return [arc.centroid(d2), outerArc.centroid(d2), pos];
            };
        });
        polyline.exit().remove();
    };
});
