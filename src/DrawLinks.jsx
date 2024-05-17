import React from 'react'

import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import '../src/App.css'


function initDiagram() {
    const diagram =
        new go.Diagram(
            {
                'undoManager.isEnabled': true,
                'clickCreatingTool.archetypeNodeData': { text: 'new scene', color: 'lightblue' },
                model: new go.GraphLinksModel(
                    {
                        linkKeyProperty: 'key',
                    }
                )
            }
        );

    // Node template
    diagram.nodeTemplate =
        new go.Node('Auto')
            .add(
                new go.Shape('RoundedRectangle',
                    {
                        fill: 'white',
                        width: 100,
                        
                    }
                ),

                new go.Panel('Table')
                    .addColumnDefinition(0, { alignment: go.Spot.Left })
                    .addColumnDefinition(2, { alignment: go.Spot.Right })
                    .add(
                        new go.TextBlock( // This is node title
                            {
                                column: 0, row: 0, columnSpan: 3, alignment: go.Spot.Center,
                                font: 'bold 10pt sans-serif', margin: new go.Margin(4,2 )
                            }
                        ).bind('text', 'key'),

                        new go.Panel('Horizontal',
                            { column: 2, row: 1 })
                            .add(
                                new go.TextBlock('A'),
                                new go.Shape('Circle', // The A port
                                    {
                                        width: 8, height: 8, portId: 'A', fromSpot: go.Spot.Right,
                                        fromLinkable: true, toMaxLinks: 1, fill: 'lightblue', strokeWidth: 0, margin:5
                                    }

                                ),
                               
                            ),
                        new go.Panel('Horizontal',
                            { column: 2, row: 2, rowSpan: 2 })
                            .add(
                                new go.TextBlock('B'),
                                new go.Shape('Circle', // B port
                                    {
                                        width: 8, height: 8, portId: 'B', toSpot: go.Spot.Left,
                                        fromLinkable: true, toMaxLinks: 1, margin:5, fill: 'lightblue', strokeWidth: 0
                                    }),
                            ),
                        new go.Panel('Horizontal',
                            { column: 0, row: 1, rowSpan: 2 })
                            .add(
                                new go.TextBlock(''),
                                new go.Shape('Circle',
                                    {
                                        width: 8, height: 8, portId: 'Out', fromSpot: go.Spot.Right,
                                        toLinkable: true, cursor: 'pointer', toMaxLinks: 1, margin:5, fill: 'grey', strokeWidth: 0
                                    }) // allows user draw links from here
                            )
                    )
            );

    diagram.linkTemplate =
        new go.Link({
            routing: go.Routing.Normal,
            corner: 3,
            relinkableFrom: true, // allow user to relink existing links
            relinkableTo: true     // allow user to relink existing links
        })
            .add(
                new go.Shape(),
                new go.Shape({ toArrow: 'Standard' })
            );

    //diagram.layout = new go.LayeredDigraphLayout({ columnSpacing: 10 });

    diagram.layout = new go.ForceDirectedLayout({
        isInitial: true,  // don't layout when nodes or links are added
        isOngoing: false,  // don't layout when nodes or links are modified
      });

    diagram.toolManager.linkingTool.temporaryLink.routing = go.Routing.Normal;

    diagram.model =
        new go.GraphLinksModel(
            {
                linkFromPortIdProperty: 'fromPort',
                linkToPortIdProperty: 'toPort',
                nodeDataArray: [
                    { key: "Escena 1" }, 
                    { key: "Escena 2" },
                    { key: "Inicio" }

                ],
                linkDataArray: [
                    // not in this case
                ]

            }
        );


    return diagram;

}

export default function DrawLinks() {
    return (
        <div>
            <ReactDiagram
                initDiagram={initDiagram}
                divClassName='diagram-component'

            />
        </div>
    )
}
