module.exports = {
  "name": "WI",
  "uri": "http://wi.i2g.cloud",
  "prefix": "wi",
  "xml": {
    "tagAlias": "lowerCase"
  },
  "associations": [],
  "types": [
    {
      "name": "ServiceTaskLike",
      "extends": ["bpmn:ServiceTask"],
      "properties": [
        {
          name: "expression",
          isAttr: true,
          type: "String"
        },
        {
          name: "idTask",
          isAttr: true,
          type: "String"
        }
        // {
        //   "name": "inputs",
        //   "isMany": true,
        //   "type": "Input"
        // },
        // {
        //   "name": "outputs",
        //   "isMany": true,
        //   "type": "Output"
        // }
      ]
    },
    // {
    //   "name": "Input",
    //   "properties": [
    //     {
    //       "name": "name",
    //       "isAttr": true,
    //       "type": "String"
    //     },
    //     {
    //       "name": "value",
    //       "isAttr": true,
    //       "type": "String"
    //     },
    //     {
    //       "name": "type",
    //       "isAttr": true,
    //       "type": "String"
    //     }
    //   ]
    // },
    // {
    //   "name": "Output",
    //   "properties": [
    //     {
    //       "name": "name",
    //       "isAttr": true,
    //       "type": "String"
    //     },
    //     {
    //       "name": "value",
    //       "isAttr": true,
    //       "type": "String"
    //     },
    //     {
    //       "name": "type",
    //       "isAttr": true,
    //       "type": "String"
    //     }
    //   ]
    // }
  ]
}
