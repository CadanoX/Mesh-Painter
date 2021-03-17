/* The official OBJ exporter only runs on BufferGeometry and therefore does not remove duplicate vertices
 * We store colors similar to MeshLab and MeshMixer appended to each vertex
 * In rare cases duplicates of the same vertex might have different colors assigned
 * For simplicity we always choose the first color encountered
 */

import { BufferGeometry } from 'three';
import { Geometry } from 'three/examples/jsm/deprecated/Geometry'

export function parseBufferGeometryToObj(bufferGeo, precision = 6) {
  if (!(bufferGeo instanceof BufferGeometry))
    return null;

  // Remove duplicate vertices
  const geo = new Geometry().fromBufferGeometry(bufferGeo);
  geo.mergeVertices();

  // .mergeVertices does not merge colors
  // For each vertex find all assigned colors
  const vertexColors = new Array(geo.vertices.length);
  for (let i = 0; i < vertexColors.length; i++)
    vertexColors[i] = [];

  let faces = "";
  for (let face of geo.faces) {
    // In .obj files, vertex indices start with 1
    faces += `f ${face.a + 1} ${face.b + 1} ${face.c + 1}\n`;
    vertexColors[face.a].push(face.vertexColors[0]);
    vertexColors[face.b].push(face.vertexColors[1]);
    vertexColors[face.c].push(face.vertexColors[2]);
  }

  let vertices = "";
  for (let i = 0; i < vertexColors.length; i++) {
    // Store the first color (we could also store the one most often applied)
    const c = vertexColors[i][0];
    const v = geo.vertices[i];
    vertices +=
      "v " + Number.parseFloat(v.x).toFixed(precision) +
      " " + Number.parseFloat(v.y).toFixed(precision) +
      " " + Number.parseFloat(v.z).toFixed(precision);
    if (c) 
      vertices +=
        " " + Number.parseFloat(c.r).toFixed(precision) +
        " " + Number.parseFloat(c.g).toFixed(precision) +
        " " + Number.parseFloat(c.b).toFixed(precision);
    vertices += "\n";
  }

  return `# Vertices: ${geo.vertices.length}\n# Faces: ${geo.faces.length}\n${vertices}${faces}`
}