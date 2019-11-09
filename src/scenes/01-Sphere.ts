import { Scene } from '../common/game';
import ShaderProgram from '../common/shader-program';
import Mesh from '../common/mesh';
import * as MeshUtils from '../common/mesh-utils';
import Camera from '../common/camera';
import FlyCameraController from '../common/camera-controllers/fly-camera-controller';
import { vec3, mat4 } from 'gl-matrix';

function calculateVertexCount(mesh: Mesh): number{
    let gl = mesh.gl;
    if(mesh.descriptors.length == 0) return 0;
    let desc = mesh.descriptors[0];
    let stride = desc.stride
    if(stride == 0){
        let dataTypeSize = 1;
        switch(desc.type){
            case gl.BYTE: case gl.UNSIGNED_BYTE: dataTypeSize = 1; break;
            case gl.SHORT: case gl.UNSIGNED_SHORT: dataTypeSize = 2; break;
            case gl.INT: case gl.UNSIGNED_INT: case gl.FLOAT: dataTypeSize = 4; break;
        }
        stride = desc.size * dataTypeSize;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.VBOs[desc.buffer]);
    let bufferSize: number = gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
    return Math.floor(bufferSize/stride);
}

// In this scene we will draw one colored rectangle in 3D
// The goal of this scene is to learn about:
// 1- How to create an send an MVP matrix (Model ,View, Projection)
export default class SphereScene extends Scene {
    program: ShaderProgram;
    mesh: Mesh;
    camera: Camera;
    controller: FlyCameraController;
    pointCloud: boolean = false;
    verticalResolution: number = 32;
    horizontalResolution: number = 32;

    public load(): void {
        // These shaders take 2 uniform: MVP for 3D transformation and Tint for modifying colors
        this.game.loader.load({
            ["color.vert"]:{url:'shaders/color.vert', type:'text'},
            ["color.frag"]:{url:'shaders/color.frag', type:'text'}
        });
    } 
    
    public start(): void {
        this.program = new ShaderProgram(this.gl);
        this.program.attach(this.game.loader.resources["color.vert"], this.gl.VERTEX_SHADER);
        this.program.attach(this.game.loader.resources["color.frag"], this.gl.FRAGMENT_SHADER);
        this.program.link();

        // Create a colored rectangle using our new Mesh class
        this.mesh = MeshUtils.ColoredSphere(this.gl, this.verticalResolution, this.horizontalResolution);

        this.gl.clearColor(0,0,0,1);

        this.camera = new Camera();
        this.camera.type = 'perspective';
        //this.camera.position = vec3.fromValues(0,0, -3); // this was the default
        this.camera.position = vec3.fromValues(0, 0, 3); // this was the default

        // added by me
        this.camera.direction = vec3.fromValues(0,0,-2);
        this.camera.aspectRatio = this.gl.drawingBufferWidth/this.gl.drawingBufferHeight;
        
        this.controller = new FlyCameraController(this.camera, this.game.input);
        this.controller.movementSensitivity = 0.005;

        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.BACK);
        this.gl.frontFace(this.gl.CCW);

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.setupControls();
    }
    
    public draw(deltaTime: number): void {
        this.controller.update(deltaTime);
        
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        this.program.use();
        
        // Now we multiply our matrices in order P*V*M
        let MVP = mat4.clone(this.camera.ViewProjectionMatrix);
        mat4.rotateX(MVP,MVP, Math.PI / 2);
        this.program.setUniformMatrix4fv("MVP", false, MVP);
        this.program.setUniformMatrix4fv("tint", false, mat4.create());

        this.mesh.draw(this.pointCloud ? this.gl.POINTS : this.gl.TRIANGLES);
        
        this.updateControls();
    }
    
    public end(): void {
        this.program.dispose();
        this.program = null;
        this.mesh.dispose();
        this.mesh = null;
        this.clearControls();
    }

    /////////////////////////////////////////////////////////
    ////// ADD CONTROL TO THE WEBPAGE (NOT IMPORTNANT) //////
    /////////////////////////////////////////////////////////
    controls: {[name: string]:HTMLElement} = {};

    private setupControls() {
        const controls = document.querySelector('#controls');
        
        const addLabel = (element: HTMLElement, text: string) => {
            let label = document.createElement('label');
            label.className = "control-label";
            label.textContent = text;
            element.appendChild(label);
            return label;
        }

        const addCheckBox = (element: HTMLElement, value: boolean, callback: (value: boolean)=>void) => {
            let checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.checked = value;
            checkbox.onchange = () => { callback(checkbox.checked) };
            element.appendChild(checkbox);
        }

        const addInteger = (element: HTMLElement, value: number, callback: (value: number)=>void, range: [number, number] = [0,100]) => {
            let textbox = document.createElement('input');
            textbox.type = "number";
            textbox.step = "1";
            textbox.min = range[0].toString();
            textbox.max = range[1].toString();
            textbox.value = value.toString();
            textbox.onchange = () => { callback(Number.parseInt(textbox.value)) };
            element.appendChild(textbox);
        }

        let statsDiv = document.createElement('div');
        statsDiv.className = "control-row";
        addLabel(statsDiv, "Vertex Count: ");
        this.controls["vertexCount"] = addLabel(statsDiv, "No Mesh Data");
        controls.appendChild(statsDiv);

        let pointCloudDiv = document.createElement('div');
        pointCloudDiv.className = "control-row";
        addLabel(pointCloudDiv, "Point Cloud");
        addCheckBox(pointCloudDiv, this.pointCloud, (value) => {this.pointCloud = value;});
        controls.appendChild(pointCloudDiv);

        let verticalResolutionDiv = document.createElement('div');
        verticalResolutionDiv.className = "control-row";
        addLabel(verticalResolutionDiv, "Vertical Resolution");
        addInteger(verticalResolutionDiv, this.verticalResolution, (value) => {
            this.verticalResolution = value;
            this.mesh = MeshUtils.ColoredSphere(this.gl, this.verticalResolution, this.horizontalResolution);
        }, [2, 256]);
        controls.appendChild(verticalResolutionDiv);

        let horizontalResolutionDiv = document.createElement('div');
        horizontalResolutionDiv.className = "control-row";
        addLabel(horizontalResolutionDiv, "Horizontal Resolution");
        addInteger(horizontalResolutionDiv, this.horizontalResolution, (value) => {
            this.horizontalResolution = value;
            this.mesh = MeshUtils.ColoredSphere(this.gl, this.verticalResolution, this.horizontalResolution);
        }, [2, 256]);
        controls.appendChild(horizontalResolutionDiv);
    }

    private updateControls() {
        this.controls["vertexCount"].textContent = this.mesh?calculateVertexCount(this.mesh).toString():"No Mesh";
    }

    private clearControls() {
        const controls = document.querySelector('#controls');
        controls.innerHTML = "";
    }

}