import React, { useEffect, useRef, useState } from "react";
import * as go from "gojs";
import "bootstrap/dist/css/bootstrap.min.css";
import { Col, Row } from "react-bootstrap";

const Historias = () => {
  const diagramDivRef = useRef(null);
  const [dragged, setDragged] = useState(null);

  useEffect(() => {
    const div = diagramDivRef.current;
    let myDiagram;

    const initDiagram = () => {
      const $ = go.GraphObject.make;
      myDiagram = $(go.Diagram, "myDiagramDiv", {
        layout: $(go.TreeLayout),
        "undoManager.isEnabled": true,
      });

      myDiagram.nodeTemplate = $(
        go.Node,
        "Auto",
        { locationSpot: go.Spot.Center },
        new go.Binding("location"),
        $(
          go.Shape,
          "Rectangle",
          { fill: "white" },
          new go.Binding("fill", "color"),
          new go.Binding("fill", "isHighlighted", (h, shape) => {
            if (h) return "transparent";
            const c = shape.part.data.color;
            return c ? c : "white";
          }).ofObject()
        ),
        $(
          go.TextBlock,
          {
            margin: 3,
            font: "bold 16px sans-serif",
            width: 100,
            height: 50,
            textAlign: "center",
            verticalAlignment: go.Spot.Center,
          },
          new go.Binding("text")
        ),
        {
          mouseDragEnter: (e, node) => (node.isHighlighted = true),
          mouseDragLeave: (e, node) => (node.isHighlighted = false),
          mouseDrop: (e, node) => {
            const newnode = e.diagram.selection.first();
            if (!mayConnect(node, newnode)) return;
            const incoming = newnode.findLinksInto().first();
            if (incoming) e.diagram.remove(incoming);
            e.diagram.model.addLinkData({ from: node.key, to: newnode.key });
          },
        }
      );

      myDiagram.linkTemplate = $(
        go.Link,
        $(
          go.Shape,
          { isPanelMain: true, strokeWidth: 6, stroke: "transparent" },
          new go.Binding("stroke", "isHighlighted", (h) =>
            h ? "red" : "transparent"
          ).ofObject()
        ),
        $(go.Shape, { isPanelMain: true, strokeWidth: 1 }),
        $(go.Shape, { toArrow: "circle" }),
        {
          mouseDragEnter: (e, link) => (link.isHighlighted = true),
          mouseDragLeave: (e, link) => (link.isHighlighted = false),
          mouseDrop: (e, link) => {
            const oldto = link.toNode;
            const newnode = e.diagram.selection.first();
            if (!mayConnect(newnode, oldto)) return;
            if (!mayConnect(link.fromNode, newnode)) return;
            link.toNode = newnode;
            e.diagram.model.addLinkData({ from: newnode.key, to: oldto.key });
          },
        }
      );

      function mayConnect(node1, node2) {
        return node1 !== node2;
      }

      myDiagram.commandHandler.doKeyDown = function () {
        const diagram = this.diagram;
        const e = diagram.lastInput;
        const control = e.meta || e.control;
        const shift = e.shift;
        const code = e.code;
        if (
          ((control && code === "KeyV") || (shift && code === "Insert")) &&
          (!diagram.commandHandler.canPasteSelection() ||
            diagram.selection.count === 0)
        ) {
          e.bubbles = true;
        } else {
          go.CommandHandler.prototype.doKeyDown.call(this);
        }
      };

      document.addEventListener("paste", (e) => {
        const paste = e.clipboardData.getData("text");
        if (paste.length > 0) {
          const loc = myDiagram.lastInput.documentPoint;
          const newdata = { text: paste, location: loc };
          myDiagram.model.addNodeData(newdata);
          const newnode = myDiagram.findNodeForData(newdata);
          if (newnode) myDiagram.select(newnode);
          myDiagram.commandHandler.copyToClipboard(null);
        } else {
          const commandHandler = myDiagram.commandHandler;
          if (commandHandler.canPasteSelection())
            commandHandler.pasteSelection();
        }
      });

      myDiagram.model = new go.GraphLinksModel(
        [{ key: 1, text: "Inicio", color: "lightblue" }],
        [
          { from: 1, to: 2 },
          { from: 1, to: 3 },
        ]
      );

      return myDiagram;
    };

    const handleDragStart = (event) => {
      if (event.target.className !== "draggable") return;
      event.dataTransfer.setData("text", event.target.textContent);
      setDragged(event.target);
      event.target.style.border = "2px solid red";
    };

    const handleDragEnd = (event) => {
      event.target.style.border = "";
      onHighlight(null);
    };

    const handleDragEnter = (event) => {
      event.preventDefault();
    };

    const handleDragOver = (event) => {
      if (div === myDiagram.div) {
        const can = event.target;
        const pixelratio = myDiagram.computePixelRatio();

        if (!(can instanceof HTMLCanvasElement)) return;

        const bbox = can.getBoundingClientRect();
        let bbw = bbox.width;
        if (bbw === 0) bbw = 0.001;
        let bbh = bbox.height;
        if (bbh === 0) bbh = 0.001;
        const mx = event.clientX - bbox.left * (can.width / pixelratio / bbw);
        const my = event.clientY - bbox.top * (can.height / pixelratio / bbh);
        const point = myDiagram.transformViewToDoc(new go.Point(mx, my));
        const part = myDiagram.findPartAt(point, true);
        onHighlight(part);
      }

      if (event.target.className === "dropzone") {
        return;
      }

      event.preventDefault();
    };

    const handleDragLeave = (event) => {
      if (event.target.className === "dropzone") {
        event.target.style.background = "";
      }
      onHighlight(null);
    };

    const handleDrop = (event) => {
      event.preventDefault();
      if (div === myDiagram.div) {
        const can = event.target;
        const pixelratio = myDiagram.computePixelRatio();

        if (!(can instanceof HTMLCanvasElement)) return;

        const bbox = can.getBoundingClientRect();
        let bbw = bbox.width;
        if (bbw === 0) bbw = 0.001;
        let bbh = bbox.height;
        if (bbh === 0) bbh = 0.001;
        const mx = event.clientX - bbox.left * (can.width / pixelratio / bbw);
        const my = event.clientY - bbox.top * (can.height / pixelratio / bbh);
        const point = myDiagram.transformViewToDoc(new go.Point(mx, my));

        myDiagram.startTransaction("new node");
        const newdata = {
          location: myDiagram.transformViewToDoc(
            new go.Point(mx - dragged.offsetX, my - dragged.offsetY)
          ),
          text: event.dataTransfer.getData("text"),
          color: "lightblue",
        };
        myDiagram.model.addNodeData(newdata);
        const newnode = myDiagram.findNodeForData(newdata);
        if (newnode) {
          newnode.ensureBounds();
          myDiagram.select(newnode);
          onDrop(newnode, point);
        }
        myDiagram.commitTransaction("new node");

        if (document.getElementById("removeCheckBox").checked)
          dragged.parentNode.removeChild(dragged);
      }
    };

    const onHighlight = (part) => {
      const oldskips = myDiagram.skipsUndoManager;
      myDiagram.skipsUndoManager = true;
      myDiagram.startTransaction("highlight");
      if (part !== null) {
        myDiagram.highlight(part);
      } else {
        myDiagram.clearHighlighteds();
      }
      myDiagram.commitTransaction("highlight");
      myDiagram.skipsUndoManager = oldskips;
    };

    const onDrop = (newNode, point) => {
      const it = myDiagram.findPartsAt(point).iterator;
      while (it.next()) {
        const part = it.value;
        if (part === newNode) continue;
        if (part && part.mouseDrop) {
          const e = new go.InputEvent();
          e.diagram = myDiagram;
          e.documentPoint = point;
          e.viewPoint = myDiagram.transformDocToView(point);
          e.up = true;
          myDiagram.lastInput = e;
          part.mouseDrop(e, part);
          return;
        }
      }
    };

    document.addEventListener("dragstart", handleDragStart, false);
    document.addEventListener("dragend", handleDragEnd, false);
    div.addEventListener("dragenter", handleDragEnter, false);
    div.addEventListener("dragover", handleDragOver, false);
    div.addEventListener("dragleave", handleDragLeave, false);
    div.addEventListener("drop", handleDrop, false);

    const diagram = initDiagram();

    return () => {
      document.removeEventListener("dragstart", handleDragStart, false);
      document.removeEventListener("dragend", handleDragEnd, false);
      div.removeEventListener("dragenter", handleDragEnter, false);
      div.removeEventListener("dragover", handleDragOver, false);
      div.removeEventListener("dragleave", handleDragLeave, false);
      div.removeEventListener("drop", handleDrop, false);
      diagram.div = null;
    };
  }, [dragged]);

  return (
    <div>
      <div
        id="myDiagramDiv"
        ref={diagramDivRef}
        style={{ width: "600px", height: "400px", border: "1px solid black", cursor: "grab"}}
      ></div>
      <div
        className="dropzone"
        style={{ width: "600px", height: "400px", border: "1px solid black" }}
      >
        <Row className="">
          <Col className=" d-flex justify-content-center align-items-center">
            <div
              className="draggable"
              draggable="true"
              style={{ width: 100, height: 50, backgroundColor: "lightgray" , alignContent: "center", justifyContent: "center", cursor: "grab" }}
            >
              Story 1
            </div>
          </Col>
        </Row>
      </div>
      <input type="checkbox" id="removeCheckBox" /> Remove after drop
    </div>
  );
};

export default Historias;
