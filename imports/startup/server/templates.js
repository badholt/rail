export const templates = [
  {
    "_id": "shp1a",
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
    "name": "Shaping 1A (5s ITI)",
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
    "_id": "shp1b",
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
              "delay": 60000,
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
    "name": "Shaping 1B (60s ITI)",
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
    "_id": "shp2",
    "author": "",
    "devices": "any",
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
    "_id": "shp2_vert",
    "author": "",
    "devices": "any",
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
                            "property": 376
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "event",
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 436
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
                  "property": 376
                }
              ],
              "subjects": [
                {
                  "name": "event",
                  "property": "clientY"
                }
              ]
            },
            {
              "comparison": "<",
              "objects": [
                {
                  "name": "event",
                  "property": "clientY"
                }
              ],
              "subjects": [
                {
                  "name": "number",
                  "property": 436
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
    "name": "Shaping 2v",
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
            "y": 0.275
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
    "_id": "shp4",
    "author": "",
    "devices": "any",
    "icon": "default bars",
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
              "delay": 30000,
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
          "contrast": 0.7,
          "delay": 0,
          "duration": 30000,
          "grid": {
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
          "spacing": 1,
          "span": 100,
          "variables": [
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
    "_id": "shp4_vert_vup",
    "author": "",
    "devices": "any",
    "icon": "default bars",
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
                            "property": 380
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "event",
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 440
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
                  "property": 380
                }
              ],
              "subjects": [
                {
                  "name": "event",
                  "property": "clientY"
                }
              ]
            },
            {
              "comparison": "<",
              "objects": [
                {
                  "name": "event",
                  "property": "clientY"
                }
              ],
              "subjects": [
                {
                  "name": "number",
                  "property": 440
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
              "delay": 30000,
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
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 380
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
                  "property": "clientY"
                }
              ],
              "subjects": [
                {
                  "name": "number",
                  "property": 380
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
                            "name": "number",
                            "property": 440
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
                  "property": 440
                }
              ],
              "subjects": [
                {
                  "name": "event",
                  "property": "clientY"
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
    "name": "Shaping 4v (Vertical Up)",
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
            "y": 0.5
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
          "duration": 30000,
          "grid": {
            "weighted": false,
            "x": 3,
            "y": 9
          },
          "location": {
            "x": 2,
            "y": 6
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
          "spacing": 1,
          "span": 100,
          "variables": [
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
    "_id": "shp4_vert_hup",
    "author": "",
    "devices": "any",
    "icon": "default bars",
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
                            "property": 380
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "event",
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 440
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
                  "property": 380
                }
              ],
              "subjects": [
                {
                  "name": "event",
                  "property": "clientY"
                }
              ]
            },
            {
              "comparison": "<",
              "objects": [
                {
                  "name": "event",
                  "property": "clientY"
                }
              ],
              "subjects": [
                {
                  "name": "number",
                  "property": 440
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
              "delay": 30000,
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
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 380
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
                  "property": "clientY"
                }
              ],
              "subjects": [
                {
                  "name": "number",
                  "property": 380
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
                            "name": "number",
                            "property": 440
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
                  "property": 440
                }
              ],
              "subjects": [
                {
                  "name": "event",
                  "property": "clientY"
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
    "name": "Shaping 4v (Horizontal Up)",
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
            "y": 0.5
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
          "duration": 30000,
          "grid": {
            "weighted": false,
            "x": 3,
            "y": 9
          },
          "location": {
            "x": 2,
            "y": 6
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
          "spacing": 1,
          "span": 100,
          "variables": [
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
    "_id": "shp6a_vert_vup",
    "author": "",
    "devices": "any",
    "icon": "default bars",
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
                            "property": 380
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "event",
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 440
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
                  "property": 380
                }
              ],
              "subjects": [
                {
                  "name": "event",
                  "property": "clientY"
                }
              ]
            },
            {
              "comparison": "<",
              "objects": [
                {
                  "name": "event",
                  "property": "clientY"
                }
              ],
              "subjects": [
                {
                  "name": "number",
                  "property": 440
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
              "delay": 30000,
              "specifications": {
                "amount": 1,
                "duplicate": true
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
                "duplicate": true
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
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 380
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
                            "property": 440
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
                  "property": "clientY"
                }
              ],
              "subjects": [
                {
                  "name": "number",
                  "property": 380
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
              "action": "store",
              "specifications": {
                "value": "V"
              },
              "targets": [
                "stimulus"
              ]
            },
            {
              "action": "store",
              "specifications": {
                "value": 0
              },
              "targets": [
                "V"
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
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 380
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
                            "property": 440
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
                  "property": 440
                }
              ],
              "subjects": [
                {
                  "name": "event",
                  "property": "clientY"
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
              "action": "store",
              "specifications": {
                "value": "H"
              },
              "targets": [
                "stimulus"
              ]
            },
            {
              "action": "store",
              "specifications": {
                "value": 0
              },
              "targets": [
                "H"
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
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 380
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
                            "property": 440
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
                  "property": "clientY"
                }
              ],
              "subjects": [
                {
                  "name": "number",
                  "property": 380
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
              "delay": 2000,
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
              "delay": 15000,
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
              "action": "store",
              "specifications": {
                "value": "H"
              },
              "targets": [
                "stimulus"
              ]
            },
            {
              "action": "store",
              "specifications": {
                "amount": 1,
                "type": "+"
              },
              "targets": [
                "H"
              ]
            },
            {
              "action": "+",
              "delay": 15000,
              "specifications": {
                "amount": 1,
                "duplicate": true
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
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 380
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
                            "property": 440
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
                  "property": 440
                }
              ],
              "subjects": [
                {
                  "name": "event",
                  "property": "clientY"
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
              "delay": 2000,
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
              "delay": 15000,
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
              "action": "store",
              "specifications": {
                "value": "V"
              },
              "targets": [
                "stimulus"
              ]
            },
            {
              "action": "store",
              "specifications": {
                "amount": 1,
                "type": "+"
              },
              "targets": [
                "V"
              ]
            },
            {
              "action": "+",
              "delay": 15000,
              "specifications": {
                "amount": 1,
                "duplicate": true
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
          "conditions": [
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
                            "property": 0
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
              "action": "store",
              "specifications": {
                "value": "V"
              },
              "targets": [
                "stimulus"
              ]
            },
            {
              "action": "store",
              "specifications": {
                "amount": 1,
                "type": "+"
              },
              "targets": [
                "V"
              ]
            }
          ],
          "event": "trial.\\d*.end",
          "incorrect": []
        },
        {
          "conditions": [
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
                            "property": 0
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
              "action": "store",
              "specifications": {
                "value": "H"
              },
              "targets": [
                "stimulus"
              ]
            },
            {
              "action": "store",
              "specifications": {
                "amount": 1,
                "type": "+"
              },
              "targets": [
                "H"
              ]
            }
          ],
          "event": "trial.\\d*.end",
          "incorrect": []
        }
      ]
    ],
    "name": "Shaping 6Av (Vertical Up)",
    "session": {
      "delay": 10000,
      "duration": 1800000,
      "iti": 10000,
      "total": 0,
      "correction": {
        "after": 3,
        "bias": 0.5,
        "number": 4,
        "offset": 0,
        "targets": [
          "stimuli.0.orientation.value"
        ]
      },
      "distribution": {
        "ratio": 0.5,
        "repeats": 3,
        "size": 225,
        "multiplier": 1.25
      },
      "storage": {
        "correction": 0,
        "stimulus": "",
        "H": 0,
        "V": 0
      }
    },
    "stages": [
      [
        {
          "delay": 0,
          "duration": 9500,
          "offset": {
            "x": 0,
            "y": 0.5
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
          "duration": 30000,
          "grid": {
            "weighted": false,
            "x": 3,
            "y": 9
          },
          "location": {
            "x": 2,
            "y": 6
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
          "spacing": 1,
          "span": 100,
          "variables": [
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
    "_id": "shp6a_vert_hup",
    "author": "",
    "devices": "any",
    "icon": "default bars",
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
                            "property": 380
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "event",
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 440
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
                  "property": 380
                }
              ],
              "subjects": [
                {
                  "name": "event",
                  "property": "clientY"
                }
              ]
            },
            {
              "comparison": "<",
              "objects": [
                {
                  "name": "event",
                  "property": "clientY"
                }
              ],
              "subjects": [
                {
                  "name": "number",
                  "property": 440
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
              "delay": 30000,
              "specifications": {
                "amount": 1,
                "duplicate": true
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
                "duplicate": true
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
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 380
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
                            "property": 440
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
                  "property": "clientY"
                }
              ],
              "subjects": [
                {
                  "name": "number",
                  "property": 380
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
              "action": "store",
              "specifications": {
                "value": "H"
              },
              "targets": [
                "stimulus"
              ]
            },
            {
              "action": "store",
              "specifications": {
                "value": 0
              },
              "targets": [
                "H"
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
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 380
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
                            "property": 440
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
                  "property": 440
                }
              ],
              "subjects": [
                {
                  "name": "event",
                  "property": "clientY"
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
              "action": "store",
              "specifications": {
                "value": "V"
              },
              "targets": [
                "stimulus"
              ]
            },
            {
              "action": "store",
              "specifications": {
                "value": 0
              },
              "targets": [
                "V"
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
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 380
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
                            "property": 440
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
                  "property": "clientY"
                }
              ],
              "subjects": [
                {
                  "name": "number",
                  "property": 380
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
              "delay": 2000,
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
              "delay": 15000,
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
              "action": "store",
              "specifications": {
                "value": "V"
              },
              "targets": [
                "stimulus"
              ]
            },
            {
              "action": "store",
              "specifications": {
                "amount": 1,
                "type": "+"
              },
              "targets": [
                "V"
              ]
            },
            {
              "action": "+",
              "delay": 15000,
              "specifications": {
                "amount": 1,
                "duplicate": true
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
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 380
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
                            "property": 440
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
                  "property": 440
                }
              ],
              "subjects": [
                {
                  "name": "event",
                  "property": "clientY"
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
              "delay": 2000,
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
              "delay": 15000,
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
              "action": "store",
              "specifications": {
                "value": "H"
              },
              "targets": [
                "stimulus"
              ]
            },
            {
              "action": "store",
              "specifications": {
                "amount": 1,
                "type": "+"
              },
              "targets": [
                "H"
              ]
            },
            {
              "action": "+",
              "delay": 15000,
              "specifications": {
                "amount": 1,
                "duplicate": true
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
          "conditions": [
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
                            "property": 0
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
              "action": "store",
              "specifications": {
                "value": "V"
              },
              "targets": [
                "stimulus"
              ]
            },
            {
              "action": "store",
              "specifications": {
                "amount": 1,
                "type": "+"
              },
              "targets": [
                "V"
              ]
            }
          ],
          "event": "trial.\\d*.end",
          "incorrect": []
        },
        {
          "conditions": [
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
                            "property": 0
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
              "action": "store",
              "specifications": {
                "value": "H"
              },
              "targets": [
                "stimulus"
              ]
            },
            {
              "action": "store",
              "specifications": {
                "amount": 1,
                "type": "+"
              },
              "targets": [
                "H"
              ]
            }
          ],
          "event": "trial.\\d*.end",
          "incorrect": []
        }
      ]
    ],
    "name": "Shaping 6Av (Horizontal Up)",
    "session": {
      "delay": 10000,
      "duration": 1800000,
      "iti": 10000,
      "total": 0,
      "correction": {
        "after": 3,
        "bias": 0.5,
        "number": 4,
        "offset": 0,
        "targets": [
          "stimuli.0.orientation.value"
        ]
      },
      "distribution": {
        "ratio": 0.5,
        "repeats": 3,
        "size": 225,
        "multiplier": 1.25
      },
      "storage": {
        "correction": 0,
        "stimulus": "",
        "H": 0,
        "V": 0
      }
    },
    "stages": [
      [
        {
          "delay": 0,
          "duration": 9500,
          "offset": {
            "x": 0,
            "y": 0.5
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
          "duration": 30000,
          "grid": {
            "weighted": false,
            "x": 3,
            "y": 9
          },
          "location": {
            "x": 2,
            "y": 6
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
          "spacing": 1,
          "span": 100,
          "variables": [
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
    "_id": "shp6b_vert_vup",
    "author": "",
    "devices": "any",
    "icon": "default bars",
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
                            "property": 380
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "event",
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 440
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
                  "property": 380
                }
              ],
              "subjects": [
                {
                  "name": "event",
                  "property": "clientY"
                }
              ]
            },
            {
              "comparison": "<",
              "objects": [
                {
                  "name": "event",
                  "property": "clientY"
                }
              ],
              "subjects": [
                {
                  "name": "number",
                  "property": 440
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
              "delay": 30000,
              "specifications": {
                "amount": 1,
                "duplicate": true
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
                "duplicate": true
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
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 380
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
                            "property": 440
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
                  "property": "clientY"
                }
              ],
              "subjects": [
                {
                  "name": "number",
                  "property": 380
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
              "action": "store",
              "specifications": {
                "value": "V"
              },
              "targets": [
                "stimulus"
              ]
            },
            {
              "action": "store",
              "specifications": {
                "value": 0
              },
              "targets": [
                "V"
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
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 380
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
                            "property": 440
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
                  "property": 440
                }
              ],
              "subjects": [
                {
                  "name": "event",
                  "property": "clientY"
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
              "action": "store",
              "specifications": {
                "value": "H"
              },
              "targets": [
                "stimulus"
              ]
            },
            {
              "action": "store",
              "specifications": {
                "value": 0
              },
              "targets": [
                "H"
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
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 380
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
                            "property": 440
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
                  "property": "clientY"
                }
              ],
              "subjects": [
                {
                  "name": "number",
                  "property": 380
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
              "delay": 15000,
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
              "action": "store",
              "specifications": {
                "value": "H"
              },
              "targets": [
                "stimulus"
              ]
            },
            {
              "action": "store",
              "specifications": {
                "amount": 1,
                "type": "+"
              },
              "targets": [
                "H"
              ]
            },
            {
              "action": "+",
              "delay": 15000,
              "specifications": {
                "amount": 1,
                "duplicate": true
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
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 380
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
                            "property": 440
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
                  "property": 440
                }
              ],
              "subjects": [
                {
                  "name": "event",
                  "property": "clientY"
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
              "delay": 15000,
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
              "action": "store",
              "specifications": {
                "value": "V"
              },
              "targets": [
                "stimulus"
              ]
            },
            {
              "action": "store",
              "specifications": {
                "amount": 1,
                "type": "+"
              },
              "targets": [
                "V"
              ]
            },
            {
              "action": "+",
              "delay": 15000,
              "specifications": {
                "amount": 1,
                "duplicate": true
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
          "conditions": [
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
                            "property": 0
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
              "action": "store",
              "specifications": {
                "value": "V"
              },
              "targets": [
                "stimulus"
              ]
            },
            {
              "action": "store",
              "specifications": {
                "amount": 1,
                "type": "+"
              },
              "targets": [
                "V"
              ]
            }
          ],
          "event": "trial.\\d*.end",
          "incorrect": []
        },
        {
          "conditions": [
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
                            "property": 0
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
              "action": "store",
              "specifications": {
                "value": "H"
              },
              "targets": [
                "stimulus"
              ]
            },
            {
              "action": "store",
              "specifications": {
                "amount": 1,
                "type": "+"
              },
              "targets": [
                "H"
              ]
            }
          ],
          "event": "trial.\\d*.end",
          "incorrect": []
        }
      ]
    ],
    "name": "Shaping 6Bv (Vertical Up)",
    "session": {
      "delay": 10000,
      "duration": 1800000,
      "iti": 10000,
      "total": 0,
      "correction": {
        "after": 3,
        "bias": 0.5,
        "number": 4,
        "offset": 0,
        "targets": [
          "stimuli.0.orientation.value"
        ]
      },
      "distribution": {
        "ratio": 0.5,
        "repeats": 3,
        "size": 225,
        "multiplier": 1.25
      },
      "storage": {
        "correction": 0,
        "stimulus": "",
        "H": 0,
        "V": 0
      }
    },
    "stages": [
      [
        {
          "delay": 0,
          "duration": 9500,
          "offset": {
            "x": 0,
            "y": 0.5
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
          "duration": 30000,
          "grid": {
            "weighted": false,
            "x": 3,
            "y": 9
          },
          "location": {
            "x": 2,
            "y": 7
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
          "spacing": 1,
          "span": 70,
          "variables": [
            "orientation"
          ],
          "weight": 14
        }
      ]
    ],
    "users": [
      "any"
    ]
  },
  {
    "_id": "shp6b_vert_hup",
    "author": "",
    "devices": "any",
    "icon": "default bars",
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
                            "property": 380
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "event",
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 440
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
                  "property": 380
                }
              ],
              "subjects": [
                {
                  "name": "event",
                  "property": "clientY"
                }
              ]
            },
            {
              "comparison": "<",
              "objects": [
                {
                  "name": "event",
                  "property": "clientY"
                }
              ],
              "subjects": [
                {
                  "name": "number",
                  "property": 440
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
              "delay": 30000,
              "specifications": {
                "amount": 1,
                "duplicate": true
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
                "duplicate": true
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
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 380
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
                            "property": 440
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
                  "property": "clientY"
                }
              ],
              "subjects": [
                {
                  "name": "number",
                  "property": 380
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
              "action": "store",
              "specifications": {
                "value": "H"
              },
              "targets": [
                "stimulus"
              ]
            },
            {
              "action": "store",
              "specifications": {
                "value": 0
              },
              "targets": [
                "H"
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
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 380
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
                            "property": 440
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
                  "property": 440
                }
              ],
              "subjects": [
                {
                  "name": "event",
                  "property": "clientY"
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
              "action": "store",
              "specifications": {
                "value": "V"
              },
              "targets": [
                "stimulus"
              ]
            },
            {
              "action": "store",
              "specifications": {
                "value": 0
              },
              "targets": [
                "V"
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
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 380
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
                            "property": 440
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
                  "property": "clientY"
                }
              ],
              "subjects": [
                {
                  "name": "number",
                  "property": 380
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
              "delay": 15000,
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
              "action": "store",
              "specifications": {
                "value": "V"
              },
              "targets": [
                "stimulus"
              ]
            },
            {
              "action": "store",
              "specifications": {
                "amount": 1,
                "type": "+"
              },
              "targets": [
                "V"
              ]
            },
            {
              "action": "+",
              "delay": 15000,
              "specifications": {
                "amount": 1,
                "duplicate": true
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
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 380
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
                            "property": 440
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
                  "property": 440
                }
              ],
              "subjects": [
                {
                  "name": "event",
                  "property": "clientY"
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
              "delay": 15000,
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
              "action": "store",
              "specifications": {
                "value": "H"
              },
              "targets": [
                "stimulus"
              ]
            },
            {
              "action": "store",
              "specifications": {
                "amount": 1,
                "type": "+"
              },
              "targets": [
                "H"
              ]
            },
            {
              "action": "+",
              "delay": 15000,
              "specifications": {
                "amount": 1,
                "duplicate": true
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
          "conditions": [
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
                            "property": 0
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
              "action": "store",
              "specifications": {
                "value": "V"
              },
              "targets": [
                "stimulus"
              ]
            },
            {
              "action": "store",
              "specifications": {
                "amount": 1,
                "type": "+"
              },
              "targets": [
                "V"
              ]
            }
          ],
          "event": "trial.\\d*.end",
          "incorrect": []
        },
        {
          "conditions": [
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
                            "property": 0
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
              "action": "store",
              "specifications": {
                "value": "H"
              },
              "targets": [
                "stimulus"
              ]
            },
            {
              "action": "store",
              "specifications": {
                "amount": 1,
                "type": "+"
              },
              "targets": [
                "H"
              ]
            }
          ],
          "event": "trial.\\d*.end",
          "incorrect": []
        }
      ]
    ],
    "name": "Shaping 6Bv (Horizontal Up)",
    "session": {
      "delay": 10000,
      "duration": 1800000,
      "iti": 10000,
      "total": 0,
      "correction": {
        "after": 3,
        "bias": 0.5,
        "number": 4,
        "offset": 0,
        "targets": [
          "stimuli.0.orientation.value"
        ]
      },
      "distribution": {
        "ratio": 0.5,
        "repeats": 3,
        "size": 225,
        "multiplier": 1.25
      },
      "storage": {
        "correction": 0,
        "stimulus": "",
        "H": 0,
        "V": 0
      }
    },
    "stages": [
      [
        {
          "delay": 0,
          "duration": 9500,
          "offset": {
            "x": 0,
            "y": 0.5
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
          "duration": 30000,
          "grid": {
            "weighted": false,
            "x": 3,
            "y": 9
          },
          "location": {
            "x": 2,
            "y": 7
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
          "spacing": 1,
          "span": 70,
          "variables": [
            "orientation"
          ],
          "weight": 14
        }
      ]
    ],
    "users": [
      "any"
    ]
  },
  {
    "_id": "shp8a",
    "author": "",
    "devices": "any",
    "icon": "default bars",
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
              "delay": 30000,
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
                "stimuli.0",
                "stimuli.1"
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
                "stimuli.0",
                "stimuli.1"
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
                "stimuli.0",
                "stimuli.1"
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
              "delay": 15000,
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
              "delay": 15000,
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
                "stimuli.0",
                "stimuli.1"
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
              "delay": 15000,
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
              "delay": 15000,
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
    "name": "Shaping 8A",
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
          "duration": 30000,
          "grid": {
            "weighted": false,
            "x": 9,
            "y": 9
          },
          "location": {
            "x": 5,
            "y": 8
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
          "spacing": 1,
          "span": 70,
          "variables": [
            "orientation"
          ],
          "weight": 14
        },
        {
          "type": "stimuli",
          "bars": 3,
          "contrast": 0.15,
          "delay": 0,
          "duration": 30000,
          "grid": {
            "weighted": false,
            "x": 9,
            "y": 9
          },
          "location": {
            "x": 5,
            "y": 6
          },
          "number": 2,
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
          "spacing": 1,
          "span": 70,
          "variables": [
            "orientation"
          ],
          "weight": 14
        }
      ]
    ],
    "users": [
      "any"
    ]
  },
  {
    "_id": "shp8a_vert",
    "author": "",
    "devices": "any",
    "icon": "default bars",
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
                            "property": 330
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "event",
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 376
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
                  "property": 330
                }
              ],
              "subjects": [
                {
                  "name": "event",
                  "property": "clientY"
                }
              ]
            },
            {
              "comparison": "<",
              "objects": [
                {
                  "name": "event",
                  "property": "clientY"
                }
              ],
              "subjects": [
                {
                  "name": "number",
                  "property": 376
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
              "delay": 30000,
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
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 330
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
                            "property": 376
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
                  "property": "clientY"
                }
              ],
              "subjects": [
                {
                  "name": "number",
                  "property": 330
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
                "stimuli.0",
                "stimuli.1"
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
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 330
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
                            "property": 376
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
                  "property": 376
                }
              ],
              "subjects": [
                {
                  "name": "event",
                  "property": "clientY"
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
                "stimuli.0",
                "stimuli.1"
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
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 330
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
                            "property": 376
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
                  "property": "clientY"
                }
              ],
              "subjects": [
                {
                  "name": "number",
                  "property": 330
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
                "stimuli.0",
                "stimuli.1"
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
              "delay": 15000,
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
              "delay": 15000,
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
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 330
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
                            "property": 376
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
                  "property": 376
                }
              ],
              "subjects": [
                {
                  "name": "event",
                  "property": "clientY"
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
                "stimuli.0",
                "stimuli.1"
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
              "delay": 15000,
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
              "delay": 15000,
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
    "name": "Shaping 8Av",
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
            "y": 0.5
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
          "duration": 30000,
          "grid": {
            "weighted": false,
            "x": 3,
            "y": 9
          },
          "location": {
            "x": 2,
            "y": 7
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
          "spacing": 1,
          "span": 70,
          "variables": [
            "orientation"
          ],
          "weight": 14
        },
        {
          "type": "stimuli",
          "bars": 3,
          "contrast": 0.15,
          "delay": 0,
          "duration": 30000,
          "grid": {
            "weighted": false,
            "x": 21,
            "y": 9
          },
          "location": {
            "x": 9,
            "y": 7
          },
          "number": 2,
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
          "spacing": 1,
          "span": 70,
          "variables": [
            "orientation"
          ],
          "weight": 14
        }
      ]
    ],
    "users": [
      "any"
    ]
  },
  {
    "_id": "shp8b_vert",
    "author": "",
    "devices": "any",
    "icon": "default bars",
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
                            "property": 330
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
                          }
                        ]
                      },
                      {
                        "comparison": "<",
                        "objects": [
                          {
                            "name": "event",
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 376
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
                  "property": 330
                }
              ],
              "subjects": [
                {
                  "name": "event",
                  "property": "clientY"
                }
              ]
            },
            {
              "comparison": "<",
              "objects": [
                {
                  "name": "event",
                  "property": "clientY"
                }
              ],
              "subjects": [
                {
                  "name": "number",
                  "property": 376
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
              "delay": 30000,
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
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 330
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
                            "property": 376
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
                  "property": "clientY"
                }
              ],
              "subjects": [
                {
                  "name": "number",
                  "property": 330
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
                "stimuli.0",
                "stimuli.1"
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
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 330
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
                            "property": 376
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
                  "property": 376
                }
              ],
              "subjects": [
                {
                  "name": "event",
                  "property": "clientY"
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
                "stimuli.0",
                "stimuli.1"
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
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 330
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
                            "property": 376
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
                  "property": "clientY"
                }
              ],
              "subjects": [
                {
                  "name": "number",
                  "property": 330
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
                "stimuli.0",
                "stimuli.1"
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
              "delay": 15000,
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
              "delay": 15000,
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
                            "property": "clientY"
                          }
                        ],
                        "subjects": [
                          {
                            "name": "number",
                            "property": 330
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
                            "property": 376
                          }
                        ],
                        "subjects": [
                          {
                            "name": "event",
                            "property": "clientY"
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
                  "property": 376
                }
              ],
              "subjects": [
                {
                  "name": "event",
                  "property": "clientY"
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
                "stimuli.0",
                "stimuli.1"
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
              "delay": 15000,
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
              "delay": 15000,
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
    "name": "Shaping 8Bv",
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
            "y": 0.5
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
          "duration": 30000,
          "grid": {
            "weighted": false,
            "x": 3,
            "y": 9
          },
          "location": {
            "x": 2,
            "y": 7
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
          "spacing": 1,
          "span": 70,
          "variables": [
            "orientation"
          ],
          "weight": 14
        },
        {
          "type": "stimuli",
          "bars": 3,
          "contrast": 0.15,
          "delay": 0,
          "duration": 30000,
          "grid": {
            "blacklist": [
              {
                "x": 9,
                "y": 6,
                "blacklist": false,
                "weight": 1
              },
              {
                "x": 13,
                "y": 6,
                "blacklist": false,
                "weight": 1
              }
            ],
            "weighted": false,
            "x": 21,
            "y": 9
          },
          "location": {
            "x": 1,
            "y": 1
          },
          "number": 2,
          "orientation": {
            "dependent": "stimuli.0.orientation",
            "transform": {
              "value": -90
            }
          },
          "spacing": 1,
          "span": 70,
          "variables": [
            "location",
            "orientation"
          ],
          "weight": 14
        }
      ]
    ],
    "users": [
      "any"
    ]
  }
];
