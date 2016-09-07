function ModelViewer(container, fileUrl, maxSizes) {
    "use strict";
    this.initialized = false;

    var _this = this,
        s = {
            container: container,
            fileUrl: fileUrl,
            maxSizes: maxSizes,
            canvasWrapperElem: null,
            scene: {},
            camera: {},
            renderer: {},
            controls: {},
            loader: {},
            mesh: {},
            planeSize: 2000 // size of square plane on scene under the rendered model

        },
        local = {
            hideViewerLoader: function() {
                s.container.find(".thumb_loader").addClass("hidden");
            },

            createCanvasWrapper: function() {
                s.canvasWrapperElem = $("<div/>");
                s.canvasWrapperElem.addClass("visualiser");
                return s.canvasWrapperElem;
            },

            createRenderer: function() {
                try {
                    s.renderer = new THREE.WebGLRenderer({
                        antialias: true,
                        alpha: true
                    });
                } catch (e) {
                    try{
                        s.renderer = new THREE.WebGLRenderer();
                    }
                    catch (e){
                        console.log('webgl error');
                        return false
                    }
                }
            },
            setControlsSettings: function() {
                s.controls.rotateSpeed = 1;
                s.controls.zoomSpeed = 4;
                s.controls.panSpeed = 2;
                s.controls.enableZoom = true;
                s.controls.enablePan = true;
                s.controls.enableDamping = false;
            },

            calculateCamPosition: function(bbox){
                // so the position of the camera should be twice the longest axis on that axis
                var longestAxis = bbox.size().x;
                if (longestAxis < bbox.size().y) longestAxis = bbox.size().y;
                if (longestAxis < bbox.size().z) longestAxis = bbox.size().z;
                var camPos = longestAxis + 10;
                return {
                    x: camPos,
                    y: camPos,
                    z: camPos
                };
            },

            updateCamPosition: function(camPosition, bbox){
                s.camera.position.set(camPosition.x, camPosition.y, camPosition.z);
                s.camera.lookAt(new THREE.Vector3(0, (bbox.size().y / 4), 0));
                s.controls.target.copy(new THREE.Vector3(0, (bbox.size().y / 4), 0));
            },

            addDirLight: function(x, y, z, color, intensity) {
                var directionalLight = new THREE.DirectionalLight(color, intensity);
                directionalLight.position.set(x, y, z);
                s.scene.add(directionalLight);
            },

            addPlane: function(size){
                var gridColor = 0xC0C0C0;
                var crossSectionColor = 0x4F4F4F;
                var step = 10;

                // generate gray lines for whole grid
                var gridGeomentry = new THREE.Geometry();
                var gridMaterial = new THREE.LineBasicMaterial({color: gridColor});

                for ( var i = - size; i <= size; i+= step){
                    gridGeomentry.vertices.push(new THREE.Vector3(-size, -0.04, i));
                    gridGeomentry.vertices.push(new THREE.Vector3(size, -0.04, i));
                    gridGeomentry.vertices.push(new THREE.Vector3(i, -0.04, -size));
                    gridGeomentry.vertices.push(new THREE.Vector3(i, -0.04, size));
                }

                var grid = new THREE.LineSegments(gridGeomentry, gridMaterial);
                s.scene.add(grid);

                //generate lines for black grid cross-section
                var crossGeometry = new THREE.Geometry();
                var crossMaterial = new THREE.LineBasicMaterial({color: crossSectionColor});
                crossGeometry.vertices.push(new THREE.Vector3(0, 0, size));
                crossGeometry.vertices.push(new THREE.Vector3(0, 0, -size));
                crossGeometry.vertices.push(new THREE.Vector3(size, 0, 0));
                crossGeometry.vertices.push(new THREE.Vector3(-size, 0, 0));

                var crossSection = new  THREE.LineSegments(crossGeometry, crossMaterial);
                s.scene.add(crossSection);
            },

            createMaxPrinterVolume: function(size){
                var boxGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
                var boxMaterial = new THREE.MeshBasicMaterial({color: 0x000000});

                // use wireframe box to show outline of build area
                var boxVolume = new THREE.Mesh(boxGeometry, boxMaterial);
                var boxEdges = new THREE.EdgesHelper(boxVolume, 0x000000);
                boxEdges.position.set(0, size.y/2, 0);
                boxEdges.updateMatrix();
                s.scene.add(boxEdges);

                // display gray plane on bottom of build area
                var boxFloorGeometry = new THREE.PlaneBufferGeometry(size.x, size.z);
                var boxFloorMaterial = new THREE.MeshBasicMaterial({
                    color: 0xDCDCDC,
                    side: THREE.BackSide,
                    transparent: true,
                    opacity: 0.5});
                var boxFloor = new THREE.Mesh(boxFloorGeometry, boxFloorMaterial);

                // since the plane is always below the part model and is invisible from the bottom it should always be rendered behind the part model
                boxFloor.renderOrder = 0;
                boxFloor.rotation.set(Math.PI / 2, 0, 0 ); // set horizontal
                s.scene.add(boxFloor);
            },

            handleRenderingError: function() {
                _this.initialized = true;
                s.container.find(".no_render_image").removeClass("hidden");
                local.hideViewerLoader();
                s.container.find(".visualiser");
            }
        };

    function animate() {
        requestAnimationFrame(animate);
        s.controls.update();
    }

    function render() {
        console.log("hi");
        console.log(s);
        s.renderer.render(s.scene, s.camera);
    }

    this.init = function() {
        try {
            // scene
            s.scene = new THREE.Scene();

            // camera
            s.camera = new THREE.PerspectiveCamera(45, 1, 1, 40000);

            // renderer
            local.createCanvasWrapper(); // sets s.canvasWrapperElem
            local.createRenderer(); // sets s.rendered if possible

            s.renderer.setSize(s.container.width(), s.container.height());
            s.renderer.setClearColor(0xffffff, 1);
            s.canvasWrapperElem[0].appendChild(s.renderer.domElement); // inserts canvas element to DOM
            s.container.append(s.canvasWrapperElem);

            // controls
            s.controls = new THREE.OrbitControls(s.camera, s.canvasWrapperElem[0]);
            local.setControlsSettings();
            s.controls.addEventListener('change', render);
        }
        catch (e) {
            local.handleRenderingError()
        }

        // loader & mesh
        s.loader = new THREE.STLLoader();
        s.loader.load(s.fileUrl, function(geometry) {
            try {
                var material = new THREE.MeshPhongMaterial({
                        color: 0x2F97F3,
                        shininess: 70,
                        transparent: true
                    });

                // create mesh
                s.mesh = new THREE.Mesh(geometry, material);
                s.mesh.renderOrder = 1;
                s.scene.add(s.mesh);
                s.mesh.scale.set(1, 1, 1);
                s.mesh.rotation.set(-Math.PI/2, 0, 0);

                // create bounding box from mesh to center it
                var bbox = new THREE.Box3().setFromObject(s.mesh);
                var move_y = 0 - bbox.min.y,
                    move_x = (0 - bbox.min.x) - (bbox.size().x / 2),
                    move_z = (0 - bbox.min.z) - (bbox.size().z / 2);
                s.mesh.position.set(move_x, move_y, move_z);

                // draw bounding box of the mesh
                var helpingBbox = new THREE.BoundingBoxHelper(s.mesh, 0x1F73EB);
                helpingBbox.update();
                s.scene.add(helpingBbox);

                // get camera position to look at the model
                var camPosition = local.calculateCamPosition(bbox);
                local.addDirLight(camPosition.x, camPosition.y, camPosition.z, 0x0092ca, 0.8);
                local.addDirLight(-camPosition.x, -camPosition.y, -camPosition.z, 0x0092ca, 0.8);
                s.scene.add(new THREE.AmbientLight(0x999999));

                local.addPlane(s.planeSize);
                local.updateCamPosition(camPosition, bbox);
                local.createMaxPrinterVolume(s.maxSizes);
                render();

                local.hideViewerLoader();
            }
            catch (e) {
                local.handleRenderingError();
            }
            _this.initialized = true;
        });
    }
}