import React, { Component } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { levels } from './LevelSelector';

const style = [
  {
    selector: 'node',
    style: {
      width: 70,
      label: 'data(name)',
      shape: 'round-rectangle',
      'font-size': 5,
      'text-max-width': 70,
      'text-valign': 'center',
      'background-color': '#b3c2d8',
      'text-wrap': 'ellipsis',
    },
  },
  {
    selector: ':parent',
    style: {
      'background-color': '#fff',
      'background-opacity': 0.3,
      'text-valign': 'top',
      'text-halign': 'center',
      'border-style': 'dashed',
      'text-margin-y': -3,
    },
  },
  {
    selector: 'edge',
    style: {
      width: 4,
      'target-arrow-shape': 'triangle',
      'line-color': '#cdd6e4',
      'target-arrow-color': '#cdd6e4',
      'curve-style': 'straight',
      'line-cap': 'square',
    },
  },
];

cytoscape.use(dagre);

export default class Diagram extends Component {
  componentDidMount() {
    this.layout = { name: 'dagre' };
    this.cy = cytoscape({
      style,
      maxZoom: 6,
      minZoom: 1,
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
      autounselectify: true,
      container: document.getElementById('cy'),
      elements: [],
      layout: this.layout,
    });
  }

  componentDidUpdate() {
    const { props, cy, layout } = this;
    const { context } = props.data;
    const elements = this.computeElements(context);

    cy.json({ elements });
    cy.ready(() => cy.layout(layout).run());
  }

  computeElements(context = {}, parent) {
    const keys = Object.keys(context);

    return keys
      .reduce((acc, key) => {
        let groups = [];
        const { relations: { to: targetsSource } = {} } = context[key];
        const validEdge = targetsSource && Object.keys(targetsSource).some((t) => keys.includes(t));
        const node = context[key];
        const name = node.name || key;
        const nodeContextKey = levels.find((k) => Object.prototype.hasOwnProperty.call(node, k));

        if (nodeContextKey) {
          groups = this.computeElements(node[nodeContextKey], key);
        }

        return acc
          .concat({ data: { name, parent, id: key } })
          .concat(
            validEdge ? Object.keys(targetsSource).map((target) => ({
              data: { id: `${key}_${target}`, source: key, target },
            })) : [],
          )
          .concat(groups);
      }, []);
  }

  render() {
    return (
      <div id="cy" />
    );
  }
}
