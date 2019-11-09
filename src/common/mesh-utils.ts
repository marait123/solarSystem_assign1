import Mesh from './mesh';
import * as OBJ from 'webgl-obj-loader';

// This file contain some helper classes to create simple meshes

const BLACK = [0, 0, 0, 255];
const RED = [255, 0, 0, 255];
const GREEN = [0, 255, 0, 255];
const BLUE = [0, 0, 255, 255];
const YELLOW = [255, 255, 0, 255];
const MAGENTA = [255, 0, 255, 255];
const CYAN = [0, 255, 255, 255];
const WHITE = [255, 255, 255, 255];

function createMesh(gl: WebGL2RenderingContext): Mesh {
    return new Mesh(gl, [
        { attributeLocation: 0, buffer: "positions", size: 3, type: gl.FLOAT, normalized: false, stride: 0, offset: 0 },
        { attributeLocation: 1, buffer: "colors", size: 4, type: gl.UNSIGNED_BYTE, normalized: true, stride: 0, offset: 0 }
    ]);
}

export function ColoredPlane(gl: WebGL2RenderingContext): Mesh {
    let mesh = createMesh(gl);
    mesh.setBufferData("positions", new Float32Array([
        -0.5, -0.5, 0.0,
        0.5, -0.5, 0.0,
        0.5,  0.5, 0.0,
        -0.5,  0.5, 0.0,
    ]), gl.STATIC_DRAW);
    mesh.setBufferData("colors", new Uint8Array([
        255,   0,   0, 255,
          0, 255,   0, 255,
          0,   0, 255, 255,
        255,   0, 255, 255,
    ]), gl.STATIC_DRAW);
    mesh.setElementsData(new Uint32Array([
        0, 1, 2,
        2, 3, 0
    ]), gl.STATIC_DRAW);
    return mesh
}

export function ColoredCube(gl: WebGL2RenderingContext): Mesh {
    let mesh = createMesh(gl);
    mesh.setBufferData("positions", new Float32Array([
        //Upper Face
        -1,  1, -1,
        -1,  1,  1,
         1,  1,  1,
         1,  1, -1,
        //Lower Face
        -1, -1, -1,
         1, -1, -1,
         1, -1,  1,
        -1, -1,  1,
        //Right Face
         1, -1, -1,
         1,  1, -1,
         1,  1,  1,
         1, -1,  1,
        //Left Face
        -1, -1, -1,
        -1, -1,  1,
        -1,  1,  1,
        -1,  1, -1,
        //Front Face
        -1, -1,  1,
         1, -1,  1,
         1,  1,  1,
        -1,  1,  1,
        //Back Face
        -1, -1, -1,
        -1,  1, -1,
         1,  1, -1,
         1, -1, -1
    ]), gl.STATIC_DRAW);
    mesh.setBufferData("colors", new Uint8Array([
        //Upper Face
        ...RED, ...RED, ...RED, ...RED,
        //Lower Face
        ...GREEN, ...GREEN, ...GREEN, ...GREEN,
        //Right Face
        ...BLUE, ...BLUE, ...BLUE, ...BLUE,
        //Left Face
        ...YELLOW, ...YELLOW, ...YELLOW, ...YELLOW,
        //Front Face
        ...MAGENTA, ...MAGENTA, ...MAGENTA, ...MAGENTA,
        //Back Face
        ...CYAN, ...CYAN, ...CYAN, ...CYAN,
    ]), gl.STATIC_DRAW);
    mesh.setElementsData(new Uint32Array([
        //Upper Face
        0, 1, 2, 2, 3, 0,
        //Lower Face
        4, 5, 6, 6, 7, 4,
        //Right Face
        8, 9, 10, 10, 11, 8,
        //Left Face
        12, 13, 14, 14, 15, 12,
        //Front Face
        16, 17, 18, 18, 19, 16,
        //Back Face
        20, 21, 22, 22, 23, 20, 
    ]), gl.STATIC_DRAW);
    return mesh;
}

export function WhiteCube(gl: WebGL2RenderingContext): Mesh {
    let mesh = createMesh(gl);
    mesh.setBufferData("positions", new Float32Array([
        //Upper Face
        -1,  1, -1,
        -1,  1,  1,
         1,  1,  1,
         1,  1, -1,
        //Lower Face
        -1, -1, -1,
         1, -1, -1,
         1, -1,  1,
        -1, -1,  1,
        //Right Face
         1, -1, -1,
         1,  1, -1,
         1,  1,  1,
         1, -1,  1,
        //Left Face
        -1, -1, -1,
        -1, -1,  1,
        -1,  1,  1,
        -1,  1, -1,
        //Front Face
        -1, -1,  1,
         1, -1,  1,
         1,  1,  1,
        -1,  1,  1,
        //Back Face
        -1, -1, -1,
        -1,  1, -1,
         1,  1, -1,
         1, -1, -1
    ]), gl.STATIC_DRAW);
    mesh.setBufferData("colors", new Uint8Array([
        //Upper Face
        ...WHITE, ...WHITE, ...WHITE, ...WHITE,
        //Lower Face
        ...WHITE, ...WHITE, ...WHITE, ...WHITE,
        //Right Face
        ...WHITE, ...WHITE, ...WHITE, ...WHITE,
        //Left Face
        ...WHITE, ...WHITE, ...WHITE, ...WHITE,
        //Front Face
        ...WHITE, ...WHITE, ...WHITE, ...WHITE,
        //Back Face
        ...WHITE, ...WHITE, ...WHITE, ...WHITE,
    ]), gl.STATIC_DRAW);
    mesh.setElementsData(new Uint32Array([
        //Upper Face
        0, 1, 2, 2, 3, 0,
        //Lower Face
        4, 5, 6, 6, 7, 4,
        //Right Face
        8, 9, 10, 10, 11, 8,
        //Left Face
        12, 13, 14, 14, 15, 12,
        //Front Face
        16, 17, 18, 18, 19, 16,
        //Back Face
        20, 21, 22, 22, 23, 20, 
    ]), gl.STATIC_DRAW);
    return mesh;
}

export function LoadOBJMesh(gl: WebGL2RenderingContext, data: string){
    let obj = new OBJ.Mesh(data);
    let mesh = createMesh(gl);
    mesh.setBufferData("positions", new Float32Array(obj.vertices), gl.STATIC_DRAW);
    let colors = new Uint8Array(obj.vertices.length * 4 / 3);
    colors.fill(255);
    mesh.setBufferData("colors", colors, gl.STATIC_DRAW);
    mesh.setElementsData(new Uint32Array(obj.indices), gl.STATIC_DRAW);
    return mesh;
}

export function ColoredCubeSphere(gl: WebGL2RenderingContext, verticalResolution: number=32, horizontalResolution: number=32): Mesh{
    // TODO: Create a colored sphere mesh and return it
    let mesh = ColoredCube(gl);
    return mesh;
}

// all i need is the gl and the radius and for the center it will be the origin of the world
export function ColoredSphere(gl: WebGL2RenderingContext, sectorCount:number, stackCount:number, radius:number = 1): Mesh {
    console.log("redius is " + radius);
    let sectorStep:number = 2 * Math.PI / sectorCount;
    let stackStep = Math.PI / stackCount;
    let sectorAngle:number;
    let stackAngle:number;
    let _pos = [];

    let verticesNum:number= ((stackCount + 1) * (sectorCount+1) * 3);
    let mesh = createMesh(gl);

    for (let i = 0; i <= stackCount; i++) {
        // longtiude will refer to the vertical sections along the width
        stackAngle = Math.PI / 2 - i * stackStep;
        let xy:number = radius * Math.cos(stackAngle);
        let z:number = radius * Math.sin(stackAngle);
        for (let j = 0; j <= sectorCount; j++) {
            // latitude will refer to the horizontal sections along the height 
            sectorAngle = j * sectorStep;
            let x = xy * Math.cos(sectorAngle);
            let y:number = xy * Math.sin(sectorAngle);
            // now add the vertices
            _pos.push(x);
            _pos.push(y);
            _pos.push(z);
        }
    }
    let _ind = [];
    
    // generate the indices
    let k1:number, k2:number;

    for (let i = 0; i < stackCount; i++) {
       k1 = i * (sectorCount + 1);
       k2 = k1 + sectorCount + 1;
        for (let j = 0; j < sectorCount; j++) {
          if(i != 0){
              _ind.push(k1);
              _ind.push(k2);
              _ind.push(k1 + 1);
          }
            if( i != (stackCount-1)){
                _ind.push(k1 + 1);
                _ind.push(k2);
                _ind.push(k2+1);
            }
            k1 = k1+1;
            k2 = k2 + 1;
        }
    }


    /// the _pos contains x y z of the the points
    let _colors = [];
    //_colors.fill(255);
    // genereate the colors
    // (r, g, b) = ((x,y,z) + 1) / 2 * 255
    for (let index = 0; index < _pos.length; index+=3) {
        
        let r = (_pos[index] + 1) / 2*255;
        let g = (_pos[index + 1] + 1) / 2*255; 
        let b = (_pos[index + 2] + 1) / 2*255;
        let w = 255;
        _colors.push(r);
        _colors.push(g);
        _colors.push(b);
        _colors.push(w);
     }

     //let colors = new Uint8Array(_pos.length * 4 / 3);
     let colors = new Uint8Array(_colors);
    
    // calulate the indices of the points that will be mapped to triangles or those that will be drawn o
    // onto the screen


    mesh.setBufferData("positions", new Float32Array(_pos
        ), gl.STATIC_DRAW);
    mesh.setBufferData("colors", colors, gl.STATIC_DRAW);
    mesh.setElementsData( new Uint32Array(_ind), gl.STATIC_DRAW);

    return mesh;
}