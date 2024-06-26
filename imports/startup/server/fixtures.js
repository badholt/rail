import '/imports/api/server.methods';

import {clients} from '/imports/api/server.methods';
import {Meteor} from 'meteor/meteor';
import {Templates} from '/imports/api/collections';

Meteor.startup(() => {
    process.env.ROOT_URL = 'http://redirect.railpage.org';

    Meteor.users.find().forEach((user) => {
        if (user.profile.device) Meteor.users.update({_id: user._id}, {
            $set: {['status.client']: {}}
        });
    });

    if (Templates.find().count() === 0) {
        const templates = [
            {
              "author": "",
              "devices": "any",
              "icon": "default bell",
              "inputs": [
                [
                  {
                    "conditions": [],
                    "correct": [
                      {
                        "action": "insert",
                        "delay": 0,
                        "targets": [
                          {
                            "type": "audio",
                            "delay": 0,
                            "duration": 1000,
                            "source": {
                              "wave": {
                                "frequency": 600,
                                "type": "sine"
                              },
                              "type": "wave"
                            },
                            "loop": "loop"
                          },
                          {
                            "type": "reward",
                            "commands": [
                              {
                                "command": "dispense",
                                "dispense": 0.008
                              }
                            ],
                            "delay": 0,
                            "duration": 0.06666666666666667
                          }
                        ]
                      },
                      {
                        "action": "+",
                        "delay": 5000,
                        "specifications": {
                          "amount": 1
                        },
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "iti.end",
                    "incorrect": []
                  },
                  {
                    "conditions": [
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "event",
                            "property": "status"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 1
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ],
                        "subjects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "=",
                                  "objects": [
                                    {
                                      "name": "event",
                                      "property": "request.reward"
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "string",
                                      "property": "off"
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ]
                      }
                    ],
                    "correct": [],
                    "event": "sensor",
                    "incorrect": []
                  },
                  {
                    "conditions": [
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "event",
                            "property": "request.reward"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "string",
                            "property": "off"
                          }
                        ]
                      }
                    ],
                    "correct": [],
                    "event": "reward",
                    "incorrect": []
                  },
                  {
                    "conditions": [],
                    "correct": [
                      {
                        "action": "+",
                        "specifications": {
                          "amount": 1
                        },
                        "delay": 0,
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "ir.entry",
                    "incorrect": []
                  }
                ]
              ],
              "name": "Shaping 1",
              "number": 0,
              "session": {
                "delay": 10000,
                "duration": 1800000,
                "iti": 15000,
                "total": 0
              },
              "stages": [
                [
                  {
                    "type": "audio",
                    "delay": 0,
                    "duration": 30,
                    "source": {
                      "wave": {
                        "frequency": 600,
                        "type": "sine"
                      },
                      "type": "wave"
                    },
                    "loop": "loop"
                  }
                ]
              ],
              "users": [
                "any"
              ]
            },
            {
              "author": "",
              "devices": "any",
              "elements": [
                [
                  {
                    "delay": 0,
                    "duration": 9500,
                    "offset": {
                      "x": 0,
                      "y": 0.85
                    },
                    "type": "cross",
                    "span": 60,
                    "weight": 12
                  },
                  {
                    "type": "audio",
                    "delay": 0,
                    "duration": 30,
                    "source": {
                      "wave": {
                        "frequency": 600,
                        "type": "sine"
                      },
                      "type": "wave"
                    },
                    "loop": "loop"
                  }
                ]
              ],
              "icon": "default bell",
              "inputs": [
                [
                  {
                    "conditions": [
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "<",
                                  "objects": [
                                    {
                                      "name": "number",
                                      "property": 370
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "event",
                                      "property": "clientX"
                                    }
                                  ]
                                },
                                {
                                  "comparison": "<",
                                  "objects": [
                                    {
                                      "name": "event",
                                      "property": "clientX"
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "number",
                                      "property": 430
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "number",
                            "property": 370
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientX"
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "event",
                            "property": "clientX"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 430
                          }
                        ]
                      }
                    ],
                    "correct": [
                      {
                        "action": "insert",
                        "delay": 0,
                        "targets": [
                          {
                            "type": "audio",
                            "delay": 0,
                            "duration": 1000,
                            "source": {
                              "wave": {
                                "frequency": 600,
                                "type": "sine"
                              },
                              "type": "wave"
                            },
                            "loop": "loop"
                          },
                          {
                            "type": "reward",
                            "commands": [
                              {
                                "command": "dispense",
                                "dispense": 0.008
                              }
                            ],
                            "delay": 0,
                            "duration": 0.06666666666666667
                          }
                        ]
                      },
                      {
                        "action": "toggle",
                        "delay": 0,
                        "specifications": {
                          "set": false
                        },
                        "targets": [
                          "cross.0"
                        ]
                      },
                      {
                        "action": "+",
                        "specifications": {
                          "amount": 1
                        },
                        "delay": 5000,
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "click",
                    "incorrect": []
                  },
                  {
                    "conditions": [
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "event",
                            "property": "status"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 1
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ],
                        "subjects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "=",
                                  "objects": [
                                    {
                                      "name": "event",
                                      "property": "request.reward"
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "string",
                                      "property": "off"
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ]
                      }
                    ],
                    "correct": [],
                    "event": "sensor",
                    "incorrect": []
                  },
                  {
                    "conditions": [
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "event",
                            "property": "request.reward"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "string",
                            "property": "off"
                          }
                        ]
                      }
                    ],
                    "correct": [],
                    "event": "reward",
                    "incorrect": []
                  },
                  {
                    "conditions": [],
                    "correct": [
                      {
                        "action": "toggle",
                        "delay": 0,
                        "specifications": {
                          "set": false
                        },
                        "targets": [
                          "cross.0"
                        ]
                      },
                      {
                        "action": "+",
                        "specifications": {
                          "amount": 1
                        },
                        "delay": 0,
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "ir.entry",
                    "incorrect": []
                  },
                  {
                    "conditions": [],
                    "correct": [
                      {
                        "action": "toggle",
                        "delay": 0,
                        "specifications": {
                          "set": false
                        },
                        "targets": [
                          "cross.0"
                        ]
                      },
                      {
                        "action": "+",
                        "specifications": {
                          "amount": 1
                        },
                        "delay": 0,
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "iti.end",
                    "incorrect": []
                  }
                ]
              ],
              "name": "Shaping 2",
              "session": {
                "delay": 10000,
                "duration": 1800000,
                "iti": 10000,
                "total": 0
              },
              "stages": [
                [
                  {
                    "delay": 0,
                    "duration": 9500,
                    "offset": {
                      "x": 0,
                      "y": 0.85
                    },
                    "type": "cross",
                    "span": 60,
                    "weight": 12
                  },
                  {
                    "type": "audio",
                    "delay": 0,
                    "duration": 30,
                    "source": {
                      "wave": {
                        "frequency": 600,
                        "type": "sine"
                      },
                      "type": "wave"
                    },
                    "loop": "loop"
                  }
                ]
              ],
              "users": [
                "any"
              ]
            },
            {
              "author": "",
              "devices": "any",
              "elements": [
                [
                  {
                    "delay": 0,
                    "duration": 9500,
                    "offset": {
                      "x": 0,
                      "y": 0.85
                    },
                    "type": "cross",
                    "span": 60,
                    "weight": 12
                  },
                  {
                    "type": "audio",
                    "delay": 0,
                    "duration": 30,
                    "source": {
                      "wave": {
                        "frequency": 600,
                        "type": "sine"
                      },
                      "type": "wave"
                    },
                    "loop": "loop"
                  }
                ],
                [
                  {
                    "type": "stimuli",
                    "bars": 3,
                    "contrast": 1,
                    "delay": 0,
                    "duration": 60000,
                    "frequency": 4,
                    "grid": {
                      "blacklist": [
                        {
                          "x": 1,
                          "y": 1,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 1,
                          "y": 2,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 1,
                          "y": 3,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 2,
                          "y": 1,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 2,
                          "y": 2,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 2,
                          "y": 3,
                          "blacklist": false,
                          "weight": 1
                        },
                        {
                          "x": 3,
                          "y": 1,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 3,
                          "y": 2,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 3,
                          "y": 3,
                          "blacklist": true,
                          "weight": 1
                        }
                      ],
                      "weighted": false,
                      "x": 3,
                      "y": 3
                    },
                    "location": {
                      "x": 1,
                      "y": 1
                    },
                    "number": 1,
                    "orientation": [
                      {
                        "units": "deg",
                        "value": 0
                      },
                      {
                        "units": "deg",
                        "value": 90
                      }
                    ],
                    "spacing": 2,
                    "span": 108,
                    "variables": [
                      "location",
                      "orientation"
                    ],
                    "weight": 12
                  }
                ]
              ],
              "icon": "",
              "inputs": [
                [
                  {
                    "conditions": [
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "<",
                                  "objects": [
                                    {
                                      "name": "number",
                                      "property": 370
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "event",
                                      "property": "clientX"
                                    }
                                  ]
                                },
                                {
                                  "comparison": "<",
                                  "objects": [
                                    {
                                      "name": "event",
                                      "property": "clientX"
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "number",
                                      "property": 430
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "number",
                            "property": 370
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientX"
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "event",
                            "property": "clientX"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 430
                          }
                        ]
                      }
                    ],
                    "correct": [
                      {
                        "action": "toggle",
                        "delay": 0,
                        "specifications": {
                          "set": false
                        },
                        "targets": [
                          "cross.0"
                        ]
                      },
                      {
                        "action": "+",
                        "delay": 0,
                        "specifications": {
                          "amount": 1
                        },
                        "targets": [
                          "stage"
                        ]
                      },
                      {
                        "action": "+",
                        "delay": 60000,
                        "specifications": {
                          "amount": 1,
                          "duplicate": 1
                        },
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "click",
                    "incorrect": []
                  },
                  {
                    "conditions": [],
                    "correct": [
                      {
                        "action": "+",
                        "specifications": {
                          "amount": 1,
                          "duplicate": 1
                        },
                        "delay": 0,
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "iti.end",
                    "incorrect": []
                  }
                ],
                [
                  {
                    "conditions": [
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "<",
                                  "objects": [
                                    {
                                      "name": "event",
                                      "property": "clientX"
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "number",
                                      "property": 370
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "event",
                            "property": "clientX"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 370
                          }
                        ]
                      },
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "stimuli",
                            "property": "0.orientation.value"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      }
                    ],
                    "correct": [
                      {
                        "action": "insert",
                        "delay": 0,
                        "targets": [
                          {
                            "type": "audio",
                            "delay": 0,
                            "duration": 1000,
                            "source": {
                              "wave": {
                                "frequency": 600,
                                "type": "sine"
                              },
                              "type": "wave"
                            },
                            "loop": "loop"
                          },
                          {
                            "type": "reward",
                            "commands": [
                              {
                                "command": "dispense",
                                "dispense": 0.008
                              }
                            ],
                            "delay": 0,
                            "duration": 0.06666666666666667
                          }
                        ]
                      },
                      {
                        "action": "toggle",
                        "delay": 0,
                        "specifications": {
                          "set": false
                        },
                        "targets": [
                          "stimuli.0"
                        ]
                      },
                      {
                        "action": "+",
                        "delay": 5000,
                        "specifications": {
                          "amount": 1
                        },
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "click",
                    "incorrect": []
                  },
                  {
                    "conditions": [
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "<",
                                  "objects": [
                                    {
                                      "name": "number",
                                      "property": 430
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "event",
                                      "property": "clientX"
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "number",
                            "property": 430
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientX"
                          }
                        ]
                      },
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "stimuli",
                            "property": "0.orientation.value"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 90
                          }
                        ]
                      }
                    ],
                    "correct": [
                      {
                        "action": "insert",
                        "delay": 0,
                        "targets": [
                          {
                            "type": "audio",
                            "delay": 0,
                            "duration": 1000,
                            "source": {
                              "wave": {
                                "frequency": 600,
                                "type": "sine"
                              },
                              "type": "wave"
                            },
                            "loop": "loop"
                          },
                          {
                            "type": "reward",
                            "commands": [
                              {
                                "command": "dispense",
                                "dispense": 0.008
                              }
                            ],
                            "delay": 0,
                            "duration": 0.06666666666666667
                          }
                        ]
                      },
                      {
                        "action": "toggle",
                        "delay": 0,
                        "specifications": {
                          "set": false
                        },
                        "targets": [
                          "stimuli.0"
                        ]
                      },
                      {
                        "action": "+",
                        "delay": 5000,
                        "specifications": {
                          "amount": 1
                        },
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "click",
                    "incorrect": []
                  },
                  {
                    "conditions": [
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "event",
                            "property": "status"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 1
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ],
                        "subjects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "=",
                                  "objects": [
                                    {
                                      "name": "event",
                                      "property": "request.reward"
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "string",
                                      "property": "off"
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ]
                      }
                    ],
                    "correct": [],
                    "event": "sensor",
                    "incorrect": []
                  },
                  {
                    "conditions": [],
                    "correct": [
                      {
                        "action": "+",
                        "specifications": {
                          "amount": 1
                        },
                        "delay": 0,
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "ir.entry",
                    "incorrect": []
                  },
                  {
                    "conditions": [],
                    "correct": [
                      {
                        "action": "+",
                        "specifications": {
                          "amount": 1,
                          "duplicate": 1
                        },
                        "delay": 0,
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "iti.end",
                    "incorrect": []
                  }
                ]
              ],
              "name": "Shaping 4",
              "session": {
                "delay": 10000,
                "duration": 1800000,
                "iti": 10000,
                "total": 0,
                "distribution": {
                  "ratio": 0.5,
                  "repeats": 3,
                  "size": 225,
                  "multiplier": 1.25
                }
              },
              "stages": [
                [
                  {
                    "delay": 0,
                    "duration": 9500,
                    "offset": {
                      "x": 0,
                      "y": 0.85
                    },
                    "type": "cross",
                    "span": 60,
                    "weight": 12
                  },
                  {
                    "type": "audio",
                    "delay": 0,
                    "duration": 30,
                    "source": {
                      "wave": {
                        "frequency": 600,
                        "type": "sine"
                      },
                      "type": "wave"
                    },
                    "loop": "loop"
                  }
                ],
                [
                  {
                    "type": "stimuli",
                    "bars": 3,
                    "contrast": 1,
                    "delay": 0,
                    "duration": 60000,
                    "frequency": 4,
                    "grid": {
                      "blacklist": [
                        {
                          "x": 1,
                          "y": 1,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 1,
                          "y": 2,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 1,
                          "y": 3,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 2,
                          "y": 1,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 2,
                          "y": 2,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 2,
                          "y": 3,
                          "blacklist": false,
                          "weight": 1
                        },
                        {
                          "x": 3,
                          "y": 1,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 3,
                          "y": 2,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 3,
                          "y": 3,
                          "blacklist": true,
                          "weight": 1
                        }
                      ],
                      "weighted": false,
                      "x": 3,
                      "y": 3
                    },
                    "location": {
                      "x": 1,
                      "y": 1
                    },
                    "number": 1,
                    "orientation": [
                      {
                        "units": "deg",
                        "value": 0
                      },
                      {
                        "units": "deg",
                        "value": 90
                      }
                    ],
                    "spacing": 2,
                    "span": 108,
                    "variables": [
                      "location",
                      "orientation"
                    ],
                    "weight": 12
                  }
                ]
              ],
              "users": [
                "any"
              ]
            },
            {
              "author": "",
              "devices": "any",
              "elements": [
                [
                  {
                    "delay": 0,
                    "duration": 9500,
                    "offset": {
                      "x": 0,
                      "y": 0.85
                    },
                    "type": "cross",
                    "span": 60,
                    "weight": 12
                  },
                  {
                    "type": "audio",
                    "delay": 0,
                    "duration": 30,
                    "source": {
                      "wave": {
                        "frequency": 600,
                        "type": "sine"
                      },
                      "type": "wave"
                    },
                    "loop": "loop"
                  }
                ],
                [
                  {
                    "type": "stimuli",
                    "bars": 3,
                    "contrast": 0.7,
                    "delay": 0,
                    "duration": 60000,
                    "frequency": 2.5,
                    "grid": {
                      "blacklist": [
                        {
                          "x": 1,
                          "y": 1,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 1,
                          "y": 2,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 1,
                          "y": 3,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 2,
                          "y": 1,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 2,
                          "y": 2,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 2,
                          "y": 3,
                          "blacklist": false,
                          "weight": 1
                        },
                        {
                          "x": 3,
                          "y": 1,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 3,
                          "y": 2,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 3,
                          "y": 3,
                          "blacklist": true,
                          "weight": 1
                        }
                      ],
                      "weighted": false,
                      "x": 3,
                      "y": 3
                    },
                    "location": {
                      "x": 1,
                      "y": 1
                    },
                    "number": 1,
                    "orientation": [
                      {
                        "units": "deg",
                        "value": 0
                      },
                      {
                        "units": "deg",
                        "value": 90
                      }
                    ],
                    "spacing": 2,
                    "span": 100,
                    "variables": [
                      "location",
                      "orientation"
                    ],
                    "weight": 20
                  }
                ]
              ],
              "icon": "",
              "inputs": [
                [
                  {
                    "conditions": [
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "<",
                                  "objects": [
                                    {
                                      "name": "number",
                                      "property": 370
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "event",
                                      "property": "clientX"
                                    }
                                  ]
                                },
                                {
                                  "comparison": "<",
                                  "objects": [
                                    {
                                      "name": "event",
                                      "property": "clientX"
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "number",
                                      "property": 430
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "number",
                            "property": 370
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientX"
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "event",
                            "property": "clientX"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 430
                          }
                        ]
                      }
                    ],
                    "correct": [
                      {
                        "action": "clear",
                        "delay": 0,
                        "specifications": {},
                        "targets": [
                          "timers"
                        ]
                      },
                      {
                        "action": "toggle",
                        "delay": 0,
                        "specifications": {
                          "set": false
                        },
                        "targets": [
                          "cross.0"
                        ]
                      },
                      {
                        "action": "+",
                        "delay": 0,
                        "specifications": {
                          "amount": 1
                        },
                        "targets": [
                          "stage"
                        ]
                      },
                      {
                        "action": "+",
                        "delay": 60000,
                        "specifications": {
                          "amount": 1,
                          "duplicate": 1
                        },
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "click",
                    "incorrect": []
                  },
                  {
                    "conditions": [],
                    "correct": [
                      {
                        "action": "clear",
                        "delay": 0,
                        "specifications": {},
                        "targets": [
                          "timers"
                        ]
                      },
                      {
                        "action": "+",
                        "specifications": {
                          "amount": 1,
                          "duplicate": 1
                        },
                        "delay": 0,
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "iti.end",
                    "incorrect": []
                  }
                ],
                [
                  {
                    "conditions": [
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "<",
                                  "objects": [
                                    {
                                      "name": "event",
                                      "property": "clientX"
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "number",
                                      "property": 370
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      },
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "<",
                                  "objects": [
                                    {
                                      "name": "number",
                                      "property": 430
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "event",
                                      "property": "clientX"
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "event",
                            "property": "clientX"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 370
                          }
                        ]
                      },
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "stimuli",
                            "property": "0.orientation.value"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      }
                    ],
                    "correct": [
                      {
                        "action": "clear",
                        "delay": 0,
                        "specifications": {},
                        "targets": [
                          "timers"
                        ]
                      },
                      {
                        "action": "insert",
                        "delay": 0,
                        "targets": [
                          {
                            "type": "audio",
                            "delay": 0,
                            "duration": 1000,
                            "source": {
                              "wave": {
                                "frequency": 600,
                                "type": "sine"
                              },
                              "type": "wave"
                            },
                            "loop": "loop"
                          },
                          {
                            "type": "reward",
                            "commands": [
                              {
                                "command": "dispense",
                                "dispense": 0.008
                              }
                            ],
                            "delay": 0,
                            "duration": 0.06666666666666667
                          }
                        ]
                      },
                      {
                        "action": "toggle",
                        "delay": 0,
                        "specifications": {
                          "set": false
                        },
                        "targets": [
                          "stimuli.0"
                        ]
                      },
                      {
                        "action": "+",
                        "delay": 5000,
                        "specifications": {
                          "amount": 1
                        },
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "click",
                    "incorrect": []
                  },
                  {
                    "conditions": [
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "<",
                                  "objects": [
                                    {
                                      "name": "event",
                                      "property": "clientX"
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "number",
                                      "property": 370
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      },
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "<",
                                  "objects": [
                                    {
                                      "name": "number",
                                      "property": 430
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "event",
                                      "property": "clientX"
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "number",
                            "property": 430
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientX"
                          }
                        ]
                      },
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "stimuli",
                            "property": "0.orientation.value"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 90
                          }
                        ]
                      }
                    ],
                    "correct": [
                      {
                        "action": "clear",
                        "delay": 0,
                        "specifications": {},
                        "targets": [
                          "timers"
                        ]
                      },
                      {
                        "action": "insert",
                        "delay": 0,
                        "targets": [
                          {
                            "type": "audio",
                            "delay": 0,
                            "duration": 1000,
                            "source": {
                              "wave": {
                                "frequency": 600,
                                "type": "sine"
                              },
                              "type": "wave"
                            },
                            "loop": "loop"
                          },
                          {
                            "type": "reward",
                            "commands": [
                              {
                                "command": "dispense",
                                "dispense": 0.008
                              }
                            ],
                            "delay": 0,
                            "duration": 0.06666666666666667
                          }
                        ]
                      },
                      {
                        "action": "toggle",
                        "delay": 0,
                        "specifications": {
                          "set": false
                        },
                        "targets": [
                          "stimuli.0"
                        ]
                      },
                      {
                        "action": "+",
                        "delay": 5000,
                        "specifications": {
                          "amount": 1
                        },
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "click",
                    "incorrect": []
                  },
                  {
                    "conditions": [
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "<",
                                  "objects": [
                                    {
                                      "name": "event",
                                      "property": "clientX"
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "number",
                                      "property": 370
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      },
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "<",
                                  "objects": [
                                    {
                                      "name": "number",
                                      "property": 430
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "event",
                                      "property": "clientX"
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "event",
                            "property": "clientX"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 370
                          }
                        ]
                      },
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "stimuli",
                            "property": "0.orientation.value"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 90
                          }
                        ]
                      }
                    ],
                    "correct": [
                      {
                        "action": "clear",
                        "delay": 0,
                        "specifications": {},
                        "targets": [
                          "timers"
                        ]
                      },
                      {
                        "action": "toggle",
                        "delay": 0,
                        "specifications": {
                          "set": false
                        },
                        "targets": [
                          "stimuli.0"
                        ]
                      },
                      {
                        "action": "style",
                        "delay": 0,
                        "specifications": {
                          "css": {
                            "background": "#222"
                          }
                        },
                        "targets": [
                          "#main-panel.nocturnal"
                        ]
                      },
                      {
                        "action": "style",
                        "delay": 5000,
                        "specifications": {
                          "css": {
                            "background": "#000"
                          }
                        },
                        "targets": [
                          "#main-panel.nocturnal"
                        ]
                      },
                      {
                        "action": "+",
                        "delay": 5000,
                        "specifications": {
                          "amount": 1
                        },
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "click",
                    "incorrect": []
                  },
                  {
                    "conditions": [
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "<",
                                  "objects": [
                                    {
                                      "name": "event",
                                      "property": "clientX"
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "number",
                                      "property": 370
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      },
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "<",
                                  "objects": [
                                    {
                                      "name": "number",
                                      "property": 430
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "event",
                                      "property": "clientX"
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "number",
                            "property": 430
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientX"
                          }
                        ]
                      },
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "stimuli",
                            "property": "0.orientation.value"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      }
                    ],
                    "correct": [
                      {
                        "action": "clear",
                        "delay": 0,
                        "specifications": {},
                        "targets": [
                          "timers"
                        ]
                      },
                      {
                        "action": "toggle",
                        "delay": 0,
                        "specifications": {
                          "set": false
                        },
                        "targets": [
                          "stimuli.0"
                        ]
                      },
                      {
                        "action": "style",
                        "delay": 0,
                        "specifications": {
                          "css": {
                            "background": "#222"
                          }
                        },
                        "targets": [
                          "#main-panel.nocturnal"
                        ]
                      },
                      {
                        "action": "style",
                        "delay": 5000,
                        "specifications": {
                          "css": {
                            "background": "#000"
                          }
                        },
                        "targets": [
                          "#main-panel.nocturnal"
                        ]
                      },
                      {
                        "action": "+",
                        "delay": 5000,
                        "specifications": {
                          "amount": 1
                        },
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "click",
                    "incorrect": []
                  },
                  {
                    "conditions": [
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "event",
                            "property": "status"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 1
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ],
                        "subjects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "=",
                                  "objects": [
                                    {
                                      "name": "event",
                                      "property": "request.reward"
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "string",
                                      "property": "off"
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ]
                      }
                    ],
                    "correct": [],
                    "event": "sensor",
                    "incorrect": []
                  },
                  {
                    "conditions": [],
                    "correct": [
                      {
                        "action": "clear",
                        "delay": 0,
                        "specifications": {},
                        "targets": [
                          "timers"
                        ]
                      },
                      {
                        "action": "+",
                        "specifications": {
                          "amount": 1
                        },
                        "delay": 0,
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "ir.entry",
                    "incorrect": []
                  },
                  {
                    "conditions": [],
                    "correct": [
                      {
                        "action": "clear",
                        "delay": 0,
                        "specifications": {},
                        "targets": [
                          "timers"
                        ]
                      },
                      {
                        "action": "+",
                        "specifications": {
                          "amount": 1,
                          "duplicate": 1
                        },
                        "delay": 0,
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "iti.end",
                    "incorrect": []
                  }
                ]
              ],
              "name": "Shaping 6",
              "session": {
                "delay": 10000,
                "duration": 1800000,
                "iti": 10000,
                "total": 0,
                "distribution": {
                  "ratio": 0.5,
                  "repeats": 3,
                  "size": 225,
                  "multiplier": 1.25
                }
              },
              "stages": [
                [
                  {
                    "delay": 0,
                    "duration": 9500,
                    "offset": {
                      "x": 0,
                      "y": 0.85
                    },
                    "type": "cross",
                    "span": 60,
                    "weight": 12
                  },
                  {
                    "type": "audio",
                    "delay": 0,
                    "duration": 30,
                    "source": {
                      "wave": {
                        "frequency": 600,
                        "type": "sine"
                      },
                      "type": "wave"
                    },
                    "loop": "loop"
                  }
                ],
                [
                  {
                    "type": "stimuli",
                    "bars": 3,
                    "contrast": 0.7,
                    "delay": 0,
                    "duration": 60000,
                    "frequency": 2.5,
                    "grid": {
                      "blacklist": [
                        {
                          "x": 1,
                          "y": 1,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 1,
                          "y": 2,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 1,
                          "y": 3,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 2,
                          "y": 1,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 2,
                          "y": 2,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 2,
                          "y": 3,
                          "blacklist": false,
                          "weight": 1
                        },
                        {
                          "x": 3,
                          "y": 1,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 3,
                          "y": 2,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 3,
                          "y": 3,
                          "blacklist": true,
                          "weight": 1
                        }
                      ],
                      "weighted": false,
                      "x": 3,
                      "y": 3
                    },
                    "location": {
                      "x": 1,
                      "y": 1
                    },
                    "number": 1,
                    "orientation": [
                      {
                        "units": "deg",
                        "value": 0
                      },
                      {
                        "units": "deg",
                        "value": 90
                      }
                    ],
                    "spacing": 2,
                    "span": 100,
                    "variables": [
                      "location",
                      "orientation"
                    ],
                    "weight": 20
                  }
                ]
              ],
              "users": [
                "any"
              ]
            },
            {
              "author": "",
              "devices": "any",
              "elements": [
                [
                  {
                    "delay": 0,
                    "duration": 9500,
                    "offset": {
                      "x": 0,
                      "y": 0.85
                    },
                    "type": "cross",
                    "span": 60,
                    "weight": 12
                  },
                  {
                    "type": "audio",
                    "delay": 0,
                    "duration": 30,
                    "source": {
                      "wave": {
                        "frequency": 600,
                        "type": "sine"
                      },
                      "type": "wave"
                    },
                    "loop": "loop"
                  }
                ],
                [
                  {
                    "type": "stimuli",
                    "bars": 3,
                    "contrast": 0.7,
                    "delay": 0,
                    "duration": 60000,
                    "frequency": 2.5,
                    "grid": {
                      "blacklist": [
                        {
                          "x": 1,
                          "y": 1,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 1,
                          "y": 2,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 1,
                          "y": 3,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 2,
                          "y": 1,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 2,
                          "y": 2,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 2,
                          "y": 3,
                          "blacklist": false,
                          "weight": 1
                        },
                        {
                          "x": 3,
                          "y": 1,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 3,
                          "y": 2,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 3,
                          "y": 3,
                          "blacklist": true,
                          "weight": 1
                        }
                      ],
                      "weighted": false,
                      "x": 3,
                      "y": 3
                    },
                    "location": {
                      "x": 1,
                      "y": 1
                    },
                    "number": 1,
                    "orientation": [
                      {
                        "units": "deg",
                        "value": 0
                      },
                      {
                        "units": "deg",
                        "value": 90
                      }
                    ],
                    "spacing": 2,
                    "span": 100,
                    "variables": [
                      "location",
                      "orientation"
                    ],
                    "weight": 20
                  }
                ]
              ],
              "icon": "",
              "inputs": [
                [
                  {
                    "conditions": [
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "<",
                                  "objects": [
                                    {
                                      "name": "number",
                                      "property": 370
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "event",
                                      "property": "clientX"
                                    }
                                  ]
                                },
                                {
                                  "comparison": "<",
                                  "objects": [
                                    {
                                      "name": "event",
                                      "property": "clientX"
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "number",
                                      "property": 430
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "number",
                            "property": 370
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientX"
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "event",
                            "property": "clientX"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 430
                          }
                        ]
                      }
                    ],
                    "correct": [
                      {
                        "action": "clear",
                        "delay": 0,
                        "specifications": {},
                        "targets": [
                          "timers"
                        ]
                      },
                      {
                        "action": "toggle",
                        "delay": 0,
                        "specifications": {
                          "set": false
                        },
                        "targets": [
                          "cross.0"
                        ]
                      },
                      {
                        "action": "+",
                        "delay": 0,
                        "specifications": {
                          "amount": 1
                        },
                        "targets": [
                          "stage"
                        ]
                      },
                      {
                        "action": "+",
                        "delay": 60000,
                        "specifications": {
                          "amount": 1,
                          "duplicate": 20
                        },
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "click",
                    "incorrect": []
                  },
                  {
                    "conditions": [],
                    "correct": [
                      {
                        "action": "clear",
                        "delay": 0,
                        "specifications": {},
                        "targets": [
                          "timers"
                        ]
                      },
                      {
                        "action": "+",
                        "specifications": {
                          "amount": 1,
                          "duplicate": 20
                        },
                        "delay": 0,
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "iti.end",
                    "incorrect": []
                  }
                ],
                [
                  {
                    "conditions": [
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "<",
                                  "objects": [
                                    {
                                      "name": "event",
                                      "property": "clientX"
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "number",
                                      "property": 370
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      },
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "<",
                                  "objects": [
                                    {
                                      "name": "number",
                                      "property": 430
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "event",
                                      "property": "clientX"
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "event",
                            "property": "clientX"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 370
                          }
                        ]
                      },
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "stimuli",
                            "property": "0.orientation.value"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      }
                    ],
                    "correct": [
                      {
                        "action": "clear",
                        "delay": 0,
                        "specifications": {},
                        "targets": [
                          "timers"
                        ]
                      },
                      {
                        "action": "insert",
                        "delay": 0,
                        "targets": [
                          {
                            "type": "audio",
                            "delay": 0,
                            "duration": 1000,
                            "source": {
                              "wave": {
                                "frequency": 600,
                                "type": "sine"
                              },
                              "type": "wave"
                            },
                            "loop": "loop"
                          },
                          {
                            "type": "reward",
                            "commands": [
                              {
                                "command": "dispense",
                                "dispense": 0.008
                              }
                            ],
                            "delay": 0,
                            "duration": 0.06666666666666667
                          }
                        ]
                      },
                      {
                        "action": "toggle",
                        "delay": 0,
                        "specifications": {
                          "set": false
                        },
                        "targets": [
                          "stimuli.0"
                        ]
                      },
                      {
                        "action": "+",
                        "delay": 5000,
                        "specifications": {
                          "amount": 1
                        },
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "click",
                    "incorrect": []
                  },
                  {
                    "conditions": [
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "<",
                                  "objects": [
                                    {
                                      "name": "event",
                                      "property": "clientX"
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "number",
                                      "property": 370
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      },
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "<",
                                  "objects": [
                                    {
                                      "name": "number",
                                      "property": 430
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "event",
                                      "property": "clientX"
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "number",
                            "property": 430
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientX"
                          }
                        ]
                      },
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "stimuli",
                            "property": "0.orientation.value"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 90
                          }
                        ]
                      }
                    ],
                    "correct": [
                      {
                        "action": "clear",
                        "delay": 0,
                        "specifications": {},
                        "targets": [
                          "timers"
                        ]
                      },
                      {
                        "action": "insert",
                        "delay": 0,
                        "targets": [
                          {
                            "type": "audio",
                            "delay": 0,
                            "duration": 1000,
                            "source": {
                              "wave": {
                                "frequency": 600,
                                "type": "sine"
                              },
                              "type": "wave"
                            },
                            "loop": "loop"
                          },
                          {
                            "type": "reward",
                            "commands": [
                              {
                                "command": "dispense",
                                "dispense": 0.008
                              }
                            ],
                            "delay": 0,
                            "duration": 0.06666666666666667
                          }
                        ]
                      },
                      {
                        "action": "toggle",
                        "delay": 0,
                        "specifications": {
                          "set": false
                        },
                        "targets": [
                          "stimuli.0"
                        ]
                      },
                      {
                        "action": "+",
                        "delay": 5000,
                        "specifications": {
                          "amount": 1
                        },
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "click",
                    "incorrect": []
                  },
                  {
                    "conditions": [
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "<",
                                  "objects": [
                                    {
                                      "name": "event",
                                      "property": "clientX"
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "number",
                                      "property": 370
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      },
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "<",
                                  "objects": [
                                    {
                                      "name": "number",
                                      "property": 430
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "event",
                                      "property": "clientX"
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "event",
                            "property": "clientX"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 370
                          }
                        ]
                      },
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "stimuli",
                            "property": "0.orientation.value"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 90
                          }
                        ]
                      }
                    ],
                    "correct": [
                      {
                        "action": "clear",
                        "delay": 0,
                        "specifications": {},
                        "targets": [
                          "timers"
                        ]
                      },
                      {
                        "action": "toggle",
                        "delay": 0,
                        "specifications": {
                          "set": false
                        },
                        "targets": [
                          "stimuli.0"
                        ]
                      },
                      {
                        "action": "style",
                        "delay": 0,
                        "specifications": {
                          "css": {
                            "background": "#222"
                          }
                        },
                        "targets": [
                          "#main-panel.nocturnal"
                        ]
                      },
                      {
                        "action": "style",
                        "delay": 5000,
                        "specifications": {
                          "css": {
                            "background": "#000"
                          }
                        },
                        "targets": [
                          "#main-panel.nocturnal"
                        ]
                      },
                      {
                        "action": "+",
                        "delay": 5000,
                        "specifications": {
                          "amount": 1,
                          "duplicate": 20
                        },
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "click",
                    "incorrect": []
                  },
                  {
                    "conditions": [
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "<",
                                  "objects": [
                                    {
                                      "name": "event",
                                      "property": "clientX"
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "number",
                                      "property": 370
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      },
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "<",
                                  "objects": [
                                    {
                                      "name": "number",
                                      "property": 430
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "event",
                                      "property": "clientX"
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "number",
                            "property": 430
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientX"
                          }
                        ]
                      },
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "stimuli",
                            "property": "0.orientation.value"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ]
                      }
                    ],
                    "correct": [
                      {
                        "action": "clear",
                        "delay": 0,
                        "specifications": {},
                        "targets": [
                          "timers"
                        ]
                      },
                      {
                        "action": "toggle",
                        "delay": 0,
                        "specifications": {
                          "set": false
                        },
                        "targets": [
                          "stimuli.0"
                        ]
                      },
                      {
                        "action": "style",
                        "delay": 0,
                        "specifications": {
                          "css": {
                            "background": "#222"
                          }
                        },
                        "targets": [
                          "#main-panel.nocturnal"
                        ]
                      },
                      {
                        "action": "style",
                        "delay": 5000,
                        "specifications": {
                          "css": {
                            "background": "#000"
                          }
                        },
                        "targets": [
                          "#main-panel.nocturnal"
                        ]
                      },
                      {
                        "action": "+",
                        "delay": 5000,
                        "specifications": {
                          "amount": 1,
                          "duplicate": 20
                        },
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "click",
                    "incorrect": []
                  },
                  {
                    "conditions": [
                      {
                        "comparison": "=",
                        "objects": [
                          {
                            "name": "event",
                            "property": "status"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 1
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "number",
                            "property": 0
                          }
                        ],
                        "subjects": [
                          {
                            "name": "count",
                            "property": {
                              "conditions": [
                                {
                                  "comparison": "=",
                                  "objects": [
                                    {
                                      "name": "event",
                                      "property": "request.reward"
                                    }
                                  ],
                                  "subjects": [
                                    {
                                      "name": "string",
                                      "property": "off"
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        ]
                      }
                    ],
                    "correct": [],
                    "event": "sensor",
                    "incorrect": []
                  },
                  {
                    "conditions": [],
                    "correct": [
                      {
                        "action": "clear",
                        "delay": 0,
                        "specifications": {},
                        "targets": [
                          "timers"
                        ]
                      },
                      {
                        "action": "+",
                        "specifications": {
                          "amount": 1
                        },
                        "delay": 0,
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "ir.entry",
                    "incorrect": []
                  },
                  {
                    "conditions": [],
                    "correct": [
                      {
                        "action": "clear",
                        "delay": 0,
                        "specifications": {},
                        "targets": [
                          "timers"
                        ]
                      },
                      {
                        "action": "+",
                        "specifications": {
                          "amount": 1,
                          "duplicate": 20
                        },
                        "delay": 0,
                        "targets": [
                          "trial"
                        ]
                      }
                    ],
                    "event": "iti.end",
                    "incorrect": []
                  }
                ]
              ],
              "name": "Shaping 6 (correction)",
              "session": {
                "delay": 10000,
                "duration": 1800000,
                "iti": 10000,
                "total": 0,
                "distribution": {
                  "ratio": 0.5,
                  "repeats": 3,
                  "size": 225,
                  "multiplier": 1.25
                }
              },
              "stages": [
                [
                  {
                    "delay": 0,
                    "duration": 9500,
                    "offset": {
                      "x": 0,
                      "y": 0.85
                    },
                    "type": "cross",
                    "span": 60,
                    "weight": 12
                  },
                  {
                    "type": "audio",
                    "delay": 0,
                    "duration": 30,
                    "source": {
                      "wave": {
                        "frequency": 600,
                        "type": "sine"
                      },
                      "type": "wave"
                    },
                    "loop": "loop"
                  }
                ],
                [
                  {
                    "type": "stimuli",
                    "bars": 3,
                    "contrast": 0.7,
                    "delay": 0,
                    "duration": 60000,
                    "frequency": 2.5,
                    "grid": {
                      "blacklist": [
                        {
                          "x": 1,
                          "y": 1,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 1,
                          "y": 2,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 1,
                          "y": 3,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 2,
                          "y": 1,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 2,
                          "y": 2,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 2,
                          "y": 3,
                          "blacklist": false,
                          "weight": 1
                        },
                        {
                          "x": 3,
                          "y": 1,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 3,
                          "y": 2,
                          "blacklist": true,
                          "weight": 1
                        },
                        {
                          "x": 3,
                          "y": 3,
                          "blacklist": true,
                          "weight": 1
                        }
                      ],
                      "weighted": false,
                      "x": 3,
                      "y": 3
                    },
                    "location": {
                      "x": 1,
                      "y": 1
                    },
                    "number": 1,
                    "orientation": [
                      {
                        "units": "deg",
                        "value": 0
                      },
                      {
                        "units": "deg",
                        "value": 90
                      }
                    ],
                    "spacing": 2,
                    "span": 100,
                    "variables": [
                      "location",
                      "orientation"
                    ],
                    "weight": 20
                  }
                ]
              ],
              "users": [
                "any"
              ]
            }
        ];

        _.each(templates, (template) => Meteor.call('addTemplate', template));
    }
});
