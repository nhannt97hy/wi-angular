exports.LINE_STYLE_SCHEMA = {
    type: 'Object',
    properties: {
        lineColor: { type: 'String', default: 'Blue' },
        lineWidth: { type: 'Integer', default: 1 },
        lineStyle: {
            type: 'Array',
            item: { type: 'Integer' },
            default: []
        },
    }
}

exports.POINT_ARRAY_SCHEMA = {
    type: 'Array',
    item: {
        type: 'Object',
        properties: {
            x: { type: 'Float' },
            y: { type: 'Float' }
        }
    }
}
