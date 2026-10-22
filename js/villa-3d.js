/**
 * NEOMEN Architects — Luxury Villa Solstice 3D Exploded Architectural Showcase
 * High-Fidelity PBR Architectural Visualization with Three.js.
 * Faithfully matches client reference storyboard with procedural PBR textures,
 * environment reflections, warm interior illumination, and detailed architecture.
 */

(function () {
    class Villa3DScene {
        constructor(container, options = {}) {
            this.container = container;
            this.options = Object.assign({
                onProgressChange: null,
                onStageChange: null
            }, options);

            this.progress = 0;
            this.targetProgress = 0;
            this.currentStage = 1;
            this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
            this.isDragging = false;
            this.previousMousePosition = { x: 0, y: 0 };
            this.orbitRotation = { x: 0, y: 0 };

            this.init();
        }

        init() {
            const width = this.container.clientWidth || window.innerWidth;
            const height = this.container.clientHeight || window.innerHeight;

            // 1. Scene setup
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0xF5F2EB); // Warm alabaster studio sweep matching reference
            this.scene.fog = new THREE.FogExp2(0xF5F2EB, 0.012);

            // 2. Camera setup (Refined 3/4 axonometric perspective matching reference render)
            this.camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 1000);
            this.initialCameraPos = new THREE.Vector3(28, 15, 30);
            this.camera.position.copy(this.initialCameraPos);
            this.cameraTarget = new THREE.Vector3(0, 3.5, 0);
            this.camera.lookAt(this.cameraTarget);

            // 3. Renderer setup
            this.renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance'
            });
            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.25;
            this.container.appendChild(this.renderer.domElement);

            // 4. Generate Procedural PBR Textures & Environment Map
            this.initTextures();
            this.initEnvironment();

            // 5. Materials Setup
            this.initMaterials();

            // 6. Lighting Setup
            this.initLighting();

            // 7. Build Detailed Architectural Model
            this.buildHouse();

            // 8. Event Listeners
            this.bindEvents();

            // 9. Start Render Loop
            this.animate = this.animate.bind(this);
            requestAnimationFrame(this.animate);
        }

        // --- PROCEDURAL TEXTURE GENERATION ---
        initTextures() {
            this.textures = {};

            // 1. Board-Formed Concrete (Tactile timber grain + form tie holes)
            const canvasConcrete = document.createElement('canvas');
            canvasConcrete.width = 1024;
            canvasConcrete.height = 1024;
            const ctxC = canvasConcrete.getContext('2d');
            ctxC.fillStyle = '#E8E4DC';
            ctxC.fillRect(0, 0, 1024, 1024);

            // Subtle timber planks lines
            for (let y = 0; y < 1024; y += 128) {
                ctxC.fillStyle = 'rgba(180, 172, 160, 0.25)';
                ctxC.fillRect(0, y, 1024, 2);
                ctxC.fillStyle = 'rgba(255, 255, 255, 0.35)';
                ctxC.fillRect(0, y + 2, 1024, 1);
            }

            // Concrete stippling & aggregate specks
            for (let i = 0; i < 4000; i++) {
                const rx = Math.random() * 1024;
                const ry = Math.random() * 1024;
                const r = Math.random() * 2 + 0.5;
                ctxC.fillStyle = Math.random() > 0.5 ? 'rgba(140, 130, 118, 0.12)' : 'rgba(255, 255, 255, 0.2)';
                ctxC.beginPath();
                ctxC.arc(rx, ry, r, 0, Math.PI * 2);
                ctxC.fill();
            }

            // Form tie circular divots
            for (let y = 64; y < 1024; y += 128) {
                for (let x = 64; x < 1024; x += 256) {
                    ctxC.fillStyle = 'rgba(120, 110, 100, 0.35)';
                    ctxC.beginPath();
                    ctxC.arc(x, y, 5, 0, Math.PI * 2);
                    ctxC.fill();
                    ctxC.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    ctxC.beginPath();
                    ctxC.arc(x + 1, y + 1, 3, 0, Math.PI * 2);
                    ctxC.fill();
                }
            }

            const concreteTex = new THREE.CanvasTexture(canvasConcrete);
            concreteTex.wrapS = THREE.RepeatWrapping;
            concreteTex.wrapT = THREE.RepeatWrapping;
            concreteTex.repeat.set(2, 2);
            this.textures.concrete = concreteTex;

            // 2. Warm Teakwood / Cedar Louver Texture
            const canvasWood = document.createElement('canvas');
            canvasWood.width = 1024;
            canvasWood.height = 1024;
            const ctxW = canvasWood.getContext('2d');
            ctxW.fillStyle = '#A3774B';
            ctxW.fillRect(0, 0, 1024, 1024);

            // Wood vertical grain streaks
            for (let x = 0; x < 1024; x += 16) {
                const shade = (Math.random() - 0.5) * 35;
                ctxW.fillStyle = `rgba(${163 + shade}, ${119 + shade * 0.8}, ${75 + shade * 0.6}, 0.65)`;
                ctxW.fillRect(x, 0, 14, 1024);
                // Dark seam
                ctxW.fillStyle = 'rgba(60, 40, 20, 0.35)';
                ctxW.fillRect(x + 14, 0, 2, 1024);
            }

            const woodTex = new THREE.CanvasTexture(canvasWood);
            woodTex.wrapS = THREE.RepeatWrapping;
            woodTex.wrapT = THREE.RepeatWrapping;
            woodTex.repeat.set(3, 1);
            this.textures.wood = woodTex;

            // 3. Travertine Stone Flooring
            const canvasTrav = document.createElement('canvas');
            canvasTrav.width = 1024;
            canvasTrav.height = 1024;
            const ctxT = canvasTrav.getContext('2d');
            ctxT.fillStyle = '#E5E0D5';
            ctxT.fillRect(0, 0, 1024, 1024);

            // Horizontal travertine sedimentary banding
            for (let i = 0; i < 50; i++) {
                const y = Math.random() * 1024;
                const h = Math.random() * 20 + 5;
                ctxT.fillStyle = Math.random() > 0.5 ? 'rgba(215, 205, 190, 0.4)' : 'rgba(245, 240, 230, 0.5)';
                ctxT.fillRect(0, y, 1024, h);
            }

            const travTex = new THREE.CanvasTexture(canvasTrav);
            travTex.wrapS = THREE.RepeatWrapping;
            travTex.wrapT = THREE.RepeatWrapping;
            travTex.repeat.set(3, 3);
            this.textures.travertine = travTex;

            // 4. Dark Quartz Countertop
            const canvasQuartz = document.createElement('canvas');
            canvasQuartz.width = 512;
            canvasQuartz.height = 512;
            const ctxQ = canvasQuartz.getContext('2d');
            ctxQ.fillStyle = '#222120';
            ctxQ.fillRect(0, 0, 512, 512);

            // Subtle white micro-veins
            for (let i = 0; i < 15; i++) {
                ctxQ.strokeStyle = 'rgba(255, 255, 255, 0.12)';
                ctxQ.lineWidth = Math.random() * 1.5 + 0.5;
                ctxQ.beginPath();
                ctxQ.moveTo(Math.random() * 512, 0);
                ctxQ.bezierCurveTo(Math.random() * 512, 200, Math.random() * 512, 350, Math.random() * 512, 512);
                ctxQ.stroke();
            }

            this.textures.quartz = new THREE.CanvasTexture(canvasQuartz);
        }

        initEnvironment() {
            // Build an architectural sky & studio reflection cubemap for realistic PBR glass and metal reflections
            const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
            const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
            const envScene = new THREE.Scene();

            // Sky gradient background for reflections
            const skyGeo = new THREE.SphereGeometry(50, 32, 16);
            const skyMat = new THREE.MeshBasicMaterial({
                color: 0xE8F0F8,
                side: THREE.BackSide
            });
            const skyMesh = new THREE.Mesh(skyGeo, skyMat);
            envScene.add(skyMesh);

            // Soft studio light cards inside reflection scene
            const lightCardGeo = new THREE.PlaneGeometry(30, 15);
            const lightCardMat = new THREE.MeshBasicMaterial({ color: 0xFFF9EE });

            const lightCard1 = new THREE.Mesh(lightCardGeo, lightCardMat);
            lightCard1.position.set(20, 25, 20);
            lightCard1.lookAt(0, 0, 0);
            envScene.add(lightCard1);

            const lightCard2 = new THREE.Mesh(lightCardGeo, lightCardMat);
            lightCard2.position.set(-20, 15, -20);
            lightCard2.lookAt(0, 0, 0);
            envScene.add(lightCard2);

            cubeCamera.update(this.renderer, envScene);
            this.scene.environment = cubeRenderTarget.texture;
        }

        initMaterials() {
            // Off-white architectural concrete
            this.matConcrete = new THREE.MeshStandardMaterial({
                color: 0xE8E4DC,
                map: this.textures.concrete,
                roughness: 0.75,
                metalness: 0.05
            });

            // Dark architectural foundation concrete
            this.matDarkConcrete = new THREE.MeshStandardMaterial({
                color: 0x383633,
                map: this.textures.concrete,
                roughness: 0.85,
                metalness: 0.1
            });

            // Travertine floor tiles
            this.matTravertine = new THREE.MeshStandardMaterial({
                color: 0xE8E3D8,
                map: this.textures.travertine,
                roughness: 0.55,
                metalness: 0.04
            });

            // Natural teakwood & cedar slats
            this.matWood = new THREE.MeshStandardMaterial({
                color: 0xA07548,
                map: this.textures.wood,
                roughness: 0.45,
                metalness: 0.05
            });

            // Smoked dark oak millwork
            this.matDarkWood = new THREE.MeshStandardMaterial({
                color: 0x48392B,
                map: this.textures.wood,
                roughness: 0.55,
                metalness: 0.05
            });

            // Ultra-realistic architectural glass with transmission & environment reflections
            this.matGlass = new THREE.MeshPhysicalMaterial ? new THREE.MeshPhysicalMaterial({
                color: 0xDDF0F7,
                transparent: true,
                opacity: 0.38,
                roughness: 0.05,
                metalness: 0.15,
                transmission: 0.82,
                ior: 1.52,
                reflectivity: 0.95
            }) : new THREE.MeshStandardMaterial({
                color: 0xDDF0F7,
                transparent: true,
                opacity: 0.35,
                roughness: 0.05,
                metalness: 0.2
            });

            // Dark anodized aluminum window mullions & structural steel
            this.matMetal = new THREE.MeshStandardMaterial({
                color: 0x181716,
                roughness: 0.25,
                metalness: 0.9
            });

            // Brushed brass & bronze accents
            this.matBrass = new THREE.MeshStandardMaterial({
                color: 0xC8A86B,
                roughness: 0.25,
                metalness: 0.92
            });

            // Ecru woven furniture fabric
            this.matFabric = new THREE.MeshStandardMaterial({
                color: 0xEDE9E1,
                roughness: 0.92,
                metalness: 0.0
            });

            // Dark quartz waterfall countertops
            this.matQuartz = new THREE.MeshStandardMaterial({
                color: 0x222120,
                map: this.textures.quartz,
                roughness: 0.28,
                metalness: 0.18
            });

            // Automotive metallic paints with high gloss reflection
            this.matCarPaintDark = new THREE.MeshStandardMaterial({
                color: 0x161C24,
                roughness: 0.12,
                metalness: 0.95
            });
            this.matCarPaintSilver = new THREE.MeshStandardMaterial({
                color: 0xBCC2CB,
                roughness: 0.15,
                metalness: 0.92
            });
            this.matCarGlass = new THREE.MeshStandardMaterial({
                color: 0x10151C,
                roughness: 0.08,
                metalness: 0.95
            });
            this.matCarTire = new THREE.MeshStandardMaterial({
                color: 0x141414,
                roughness: 0.95,
                metalness: 0.05
            });
        }

        initLighting() {
            // Ambient warm studio fill
            const ambient = new THREE.AmbientLight(0xFFF7EC, 0.95);
            this.scene.add(ambient);

            // Natural sky/ground hemisphere gradient
            const hemiLight = new THREE.HemisphereLight(0xFDF9F3, 0xD4CBBB, 0.5);
            this.scene.add(hemiLight);

            // Key Sunlight (Crisp architectural shadows aligned with reference photo angle)
            this.sunLight = new THREE.DirectionalLight(0xFFFAF0, 1.55);
            this.sunLight.position.set(28, 42, 24);
            this.sunLight.castShadow = true;
            this.sunLight.shadow.mapSize.width = 2048;
            this.sunLight.shadow.mapSize.height = 2048;
            this.sunLight.shadow.camera.near = 5;
            this.sunLight.shadow.camera.far = 95;
            const d = 24;
            this.sunLight.shadow.camera.left = -d;
            this.sunLight.shadow.camera.right = d;
            this.sunLight.shadow.camera.top = d;
            this.sunLight.shadow.camera.bottom = -d;
            this.sunLight.shadow.bias = -0.0003;
            this.scene.add(this.sunLight);

            // Subtle cool fill from opposite side
            const rimLight = new THREE.DirectionalLight(0xD8E5F0, 0.45);
            rimLight.position.set(-25, 20, -22);
            this.scene.add(rimLight);

            // Ground shadow catcher plane
            const shadowPlaneGeo = new THREE.PlaneGeometry(140, 140);
            const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.24 });
            const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
            shadowPlane.rotation.x = -Math.PI / 2;
            shadowPlane.position.y = -2.48;
            shadowPlane.receiveShadow = true;
            this.scene.add(shadowPlane);
        }

        buildHouse() {
            // Master root container
            this.houseRoot = new THREE.Group();
            this.scene.add(this.houseRoot);

            // 1. Static Plinth & Landscape Water Court Base
            this.buildPlinth();

            // 2. Subterranean Level Group (Lowers on explode)
            this.subterraneanGroup = new THREE.Group();
            this.buildSubterranean();
            this.houseRoot.add(this.subterraneanGroup);

            // 3. Ground Level Group (Living, Dining, Kitchen, Floating Stairs)
            this.groundGroup = new THREE.Group();
            this.buildGroundLevel();
            this.houseRoot.add(this.groundGroup);

            // 4. Front Glass Façade Group (Slides forward)
            this.frontGlassGroup = new THREE.Group();
            this.buildFrontGlass();
            this.houseRoot.add(this.frontGlassGroup);

            // 5. Left Cantilever Wing Group (Slides left)
            this.leftWingGroup = new THREE.Group();
            this.buildLeftWing();
            this.houseRoot.add(this.leftWingGroup);

            // 6. Right Cantilever Wing Group (Slides right)
            this.rightWingGroup = new THREE.Group();
            this.buildRightWing();
            this.houseRoot.add(this.rightWingGroup);

            // 7. Floating Exterior Wall Panels Group (Moves out left/right)
            this.floatingPanelsGroup = new THREE.Group();
            this.buildFloatingPanels();
            this.houseRoot.add(this.floatingPanelsGroup);

            // 8. Upper Floor Group (Master Suite, Hallway, Terrace) (Lifts up)
            this.upperGroup = new THREE.Group();
            this.buildUpperLevel();
            this.houseRoot.add(this.upperGroup);

            // 9. Roof & Rooftop Canopy Group (Lifts highest)
            this.roofGroup = new THREE.Group();
            this.buildRoofLevel();
            this.houseRoot.add(this.roofGroup);

            // Store initial transforms for exact reversible interpolation
            this.initialPositions = {
                roofY: this.roofGroup.position.y,
                upperY: this.upperGroup.position.y,
                leftWingX: this.leftWingGroup.position.x,
                rightWingX: this.rightWingGroup.position.x,
                frontGlassZ: this.frontGlassGroup.position.z,
                subterraneanY: this.subterraneanGroup.position.y,
                groundY: this.groundGroup.position.y,
                floatingPanelsX: this.floatingPanelsGroup.position.x
            };
        }

        // --- DETAILED SECTION BUILDERS ---

        buildPlinth() {
            const plinthGroup = new THREE.Group();

            // Stepped travertine architectural podium
            const baseGeo = new THREE.BoxGeometry(23, 0.5, 19);
            const base = new THREE.Mesh(baseGeo, this.matTravertine);
            base.position.set(0, -2.2, 0);
            base.receiveShadow = true;
            plinthGroup.add(base);

            // Water reflection court (reflects sunlight and sky)
            const poolGeo = new THREE.BoxGeometry(6.5, 0.12, 3.5);
            const poolMat = new THREE.MeshStandardMaterial({
                color: 0x5C8B99,
                roughness: 0.1,
                metalness: 0.6
            });
            const pool = new THREE.Mesh(poolGeo, poolMat);
            pool.position.set(-6.8, -2.15, 8.2);
            pool.receiveShadow = true;
            plinthGroup.add(pool);

            // Entrance stone stepping platforms with cantilever shadow
            for (let i = 0; i < 4; i++) {
                const step = new THREE.Mesh(
                    new THREE.BoxGeometry(5.0 + i * 0.4, 0.14, 1.1),
                    this.matConcrete
                );
                step.position.set(0.5, -2.15 + i * 0.14, 9.8 - i * 0.85);
                step.receiveShadow = true;
                step.castShadow = true;
                plinthGroup.add(step);
            }

            // Surrounding gravel bed
            const gravel = new THREE.Mesh(
                new THREE.BoxGeometry(26, 0.08, 22),
                new THREE.MeshStandardMaterial({ color: 0xD8D4CA, roughness: 0.98 })
            );
            gravel.position.set(0, -2.42, 0);
            gravel.receiveShadow = true;
            plinthGroup.add(gravel);

            this.houseRoot.add(plinthGroup);
        }

        buildSubterranean() {
            // Basement concrete retaining structure
            const slab = new THREE.Mesh(new THREE.BoxGeometry(16.5, 0.4, 13.5), this.matDarkConcrete);
            slab.position.set(0, -2.0, -0.5);
            slab.receiveShadow = true;
            this.subterraneanGroup.add(slab);

            // Rear & side retaining concrete walls
            const rearWall = new THREE.Mesh(new THREE.BoxGeometry(16.5, 2.3, 0.45), this.matDarkConcrete);
            rearWall.position.set(0, -0.85, -7.0);
            rearWall.castShadow = true;
            this.subterraneanGroup.add(rearWall);

            const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.45, 2.3, 13.5), this.matDarkConcrete);
            sideWall.position.set(-8.0, -0.85, -0.5);
            sideWall.castShadow = true;
            this.subterraneanGroup.add(sideWall);

            // Structural concrete pillars
            for (let x of [-3.8, 3.8]) {
                const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.3, 0.6), this.matConcrete);
                pillar.position.set(x, -0.85, 5.2);
                pillar.castShadow = true;
                this.subterraneanGroup.add(pillar);
            }

            // Subterranean luxury car 1: Dark metallic sports coupe
            const car1 = this.createSculptedCar(this.matCarPaintDark, this.matCarGlass);
            car1.position.set(-3.0, -1.75, 1.2);
            car1.rotation.y = -0.06;
            this.subterraneanGroup.add(car1);

            // Subterranean luxury car 2: Metallic silver executive sedan
            const car2 = this.createSculptedCar(this.matCarPaintSilver, this.matCarGlass);
            car2.position.set(2.6, -1.75, 1.5);
            car2.rotation.y = 0.08;
            this.subterraneanGroup.add(car2);

            // Built-in illuminated library / wine cellar display
            const bookShelves = this.createDetailedBookcase();
            bookShelves.position.set(5.8, -0.85, -6.0);
            this.subterraneanGroup.add(bookShelves);

            // Warm subterranean accent light
            const basementLight = new THREE.PointLight(0xFFCC77, 1.8, 12);
            basementLight.position.set(0, -0.4, 0);
            this.subterraneanGroup.add(basementLight);
        }

        buildGroundLevel() {
            // Ground floor slab with refined travertine edge
            const floorSlab = new THREE.Mesh(new THREE.BoxGeometry(17.4, 0.42, 14.5), this.matTravertine);
            floorSlab.position.set(0, 0.21, 0);
            floorSlab.receiveShadow = true;
            floorSlab.castShadow = true;
            this.groundGroup.add(floorSlab);

            // Rear architectural concrete wall with teakwood accents
            const backWall = new THREE.Mesh(new THREE.BoxGeometry(17.0, 2.9, 0.4), this.matConcrete);
            backWall.position.set(0, 1.75, -6.8);
            backWall.castShadow = true;
            this.groundGroup.add(backWall);

            // Teakwood accent panel on back wall
            const woodPanel = new THREE.Mesh(new THREE.BoxGeometry(7.0, 2.7, 0.1), this.matWood);
            woodPanel.position.set(-3.6, 1.75, -6.55);
            this.groundGroup.add(woodPanel);

            // Architectural Living Room: Sectional sofa
            const sofa = this.createDetailedSofa();
            sofa.position.set(-2.8, 0.42, 1.6);
            this.groundGroup.add(sofa);

            // Smoked walnut & marble coffee table
            const table = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.28, 1.5), this.matDarkWood);
            table.position.set(-2.0, 0.56, 1.6);
            table.castShadow = true;
            this.groundGroup.add(table);

            // Wool area rug
            const rug = new THREE.Mesh(
                new THREE.BoxGeometry(5.2, 0.02, 4.2),
                new THREE.MeshStandardMaterial({ color: 0xD2CCC0, roughness: 0.95 })
            );
            rug.position.set(-2.4, 0.43, 1.6);
            rug.receiveShadow = true;
            this.groundGroup.add(rug);

            // Monolithic kitchen island with dark quartz waterfall counter
            const island = new THREE.Mesh(new THREE.BoxGeometry(4.0, 1.05, 1.6), this.matQuartz);
            island.position.set(4.8, 0.94, -1.8);
            island.castShadow = true;
            this.groundGroup.add(island);

            // Undermount brass sink & faucet
            const faucet = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8), this.matBrass);
            faucet.position.set(4.8, 1.6, -1.8);
            this.groundGroup.add(faucet);

            // Kitchen bar stools with brass pedestals
            for (let i = 0; i < 3; i++) {
                const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.78, 16), this.matBrass);
                stool.position.set(3.8 + i * 1.1, 0.81, -0.5);
                stool.castShadow = true;
                this.groundGroup.add(stool);
            }

            // Smoked oak dining table & chairs
            const diningTable = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.12, 1.7), this.matDarkWood);
            diningTable.position.set(4.6, 0.95, 2.8);
            diningTable.castShadow = true;
            this.groundGroup.add(diningTable);

            // Signature Architectural Floating Teakwood Staircase
            const stairs = this.createDetailedStaircase();
            stairs.position.set(0.6, 0.42, -2.6);
            this.groundGroup.add(stairs);

            // Suspended glowing glass globe pendant chandeliers
            for (let i = 0; i < 3; i++) {
                const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.3, 8), this.matMetal);
                rod.position.set(-2.2 + i * 1.3, 2.45, 1.6);
                this.groundGroup.add(rod);

                const globe = new THREE.Mesh(
                    new THREE.SphereGeometry(0.28, 16, 16),
                    new THREE.MeshStandardMaterial({
                        color: 0xFFF2D5,
                        emissive: 0xFFAA44,
                        emissiveIntensity: 0.9
                    })
                );
                globe.position.set(-2.2 + i * 1.3, 1.7, 1.6);
                this.groundGroup.add(globe);
            }

            // Warm interior ambient point light
            const livingLight = new THREE.PointLight(0xFFAA44, 2.2, 14);
            livingLight.position.set(-1.0, 2.3, 1.0);
            this.groundGroup.add(livingLight);
        }

        buildFrontGlass() {
            // Front double-height glass curtain wall with slim black mullions
            const glassWall = new THREE.Mesh(new THREE.BoxGeometry(11.4, 5.8, 0.06), this.matGlass);
            glassWall.position.set(0, 3.2, 7.0);
            this.frontGlassGroup.add(glassWall);

            // Vertical aluminum mullions
            for (let i = -5.2; i <= 5.2; i += 2.1) {
                const vMullion = new THREE.Mesh(new THREE.BoxGeometry(0.09, 5.8, 0.14), this.matMetal);
                vMullion.position.set(i, 3.2, 7.0);
                this.frontGlassGroup.add(vMullion);
            }
            // Horizontal aluminum mullions
            for (let y of [0.4, 3.0, 6.0]) {
                const hMullion = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.09, 0.14), this.matMetal);
                hMullion.position.set(0, y, 7.0);
                this.frontGlassGroup.add(hMullion);
            }
        }

        buildLeftWing() {
            // Cantilevered white concrete box (upper left study / guest volume)
            const boxFrame = new THREE.Mesh(new THREE.BoxGeometry(5.6, 3.4, 6.4), this.matConcrete);
            boxFrame.position.set(-7.8, 4.5, 2.4);
            boxFrame.castShadow = true;
            this.leftWingGroup.add(boxFrame);

            // Recessed window cutout with dark frame & glass
            const windowGlass = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.4, 0.05), this.matGlass);
            windowGlass.position.set(-7.8, 4.5, 5.52);
            this.leftWingGroup.add(windowGlass);

            const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.6, 0.12), this.matMetal);
            windowFrame.position.set(-7.8, 4.5, 5.5);
            this.leftWingGroup.add(windowFrame);

            // Cantilevered terrace glass balcony railing
            const railing = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.95, 0.05), this.matGlass);
            railing.position.set(-7.8, 3.3, 5.7);
            this.leftWingGroup.add(railing);
        }

        buildRightWing() {
            // Cantilevered upper right volume with warm vertical wood siding
            const woodBox = new THREE.Mesh(new THREE.BoxGeometry(5.4, 3.2, 6.0), this.matWood);
            woodBox.position.set(7.6, 4.4, 2.0);
            woodBox.castShadow = true;
            this.rightWingGroup.add(woodBox);

            // Dark concrete perimeter overhang
            const trim = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.28, 6.2), this.matDarkConcrete);
            trim.position.set(7.6, 6.05, 2.0);
            this.rightWingGroup.add(trim);

            // Upper terrace glass balustrade
            const balconyGlass = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.95, 0.05), this.matGlass);
            balconyGlass.position.set(7.6, 3.3, 5.1);
            this.rightWingGroup.add(balconyGlass);
        }

        buildFloatingPanels() {
            // 6 Vertical architectural panels (as in reference storyboard stages 3 & 5)
            // Left 3 floating panels
            for (let i = 0; i < 3; i++) {
                const panel = new THREE.Mesh(
                    new THREE.BoxGeometry(0.25, 4.8, 1.8),
                    i % 2 === 0 ? this.matConcrete : this.matWood
                );
                panel.position.set(-12.0 - i * 1.0, 3.4 + (i % 2) * 0.5, 4.2 - i * 3.4);
                panel.castShadow = true;
                this.floatingPanelsGroup.add(panel);
            }

            // Right 3 floating panels
            for (let i = 0; i < 3; i++) {
                const panel = new THREE.Mesh(
                    new THREE.BoxGeometry(0.25, 4.8, 1.8),
                    i % 2 === 0 ? this.matConcrete : this.matWood
                );
                panel.position.set(12.0 + i * 1.0, 3.4 + (i % 2) * 0.5, 4.2 - i * 3.4);
                panel.castShadow = true;
                this.floatingPanelsGroup.add(panel);
            }
        }

        buildUpperLevel() {
            // Upper floor slab
            const floorSlab = new THREE.Mesh(new THREE.BoxGeometry(17.0, 0.38, 14.2), this.matConcrete);
            floorSlab.position.set(0, 3.1, 0);
            floorSlab.receiveShadow = true;
            floorSlab.castShadow = true;
            this.upperGroup.add(floorSlab);

            // Master Bedroom: King-size luxury platform bed
            const bed = this.createDetailedBed();
            bed.position.set(4.0, 3.3, -1.8);
            this.upperGroup.add(bed);

            // Master suite warm teakwood headboard slat wall
            const headboardWall = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.5, 0.12), this.matWood);
            headboardWall.position.set(4.0, 4.5, -4.3);
            this.upperGroup.add(headboardWall);

            // Upper mezzanine walkway glass balustrade looking down to living room
            const walkwayRail = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.95, 0.05), this.matGlass);
            walkwayRail.position.set(0, 3.75, 0.6);
            this.upperGroup.add(walkwayRail);

            // Upper warm interior point lights
            const suiteLight = new THREE.PointLight(0xFFAA44, 1.8, 12);
            suiteLight.position.set(3.8, 5.0, -1.6);
            this.upperGroup.add(suiteLight);
        }

        buildRoofLevel() {
            // Main flat cantilevered concrete roof slab with dark fascia edge
            const mainRoof = new THREE.Mesh(new THREE.BoxGeometry(18.6, 0.42, 15.6), this.matConcrete);
            mainRoof.position.set(0, 6.15, 0.2);
            mainRoof.castShadow = true;
            this.roofGroup.add(mainRoof);

            // Dark perimeter fascia trim
            const fascia = new THREE.Mesh(new THREE.BoxGeometry(18.7, 0.12, 15.7), this.matMetal);
            fascia.position.set(0, 6.35, 0.2);
            this.roofGroup.add(fascia);

            // Rooftop Pavilion / Skylight Enclosure
            const pavilion = new THREE.Mesh(new THREE.BoxGeometry(8.8, 1.9, 6.8), this.matGlass);
            pavilion.position.set(1.6, 7.2, -0.5);
            this.roofGroup.add(pavilion);

            // Overlapping elevated thin roof canopy
            this.canopyRoof = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.28, 8.0), this.matDarkConcrete);
            this.canopyRoof.position.set(1.6, 8.25, -0.5);
            this.canopyRoof.castShadow = true;
            this.roofGroup.add(this.canopyRoof);

            // Slender steel canopy support posts
            for (let dx of [-4.2, 4.2]) {
                for (let dz of [-3.2, 3.2]) {
                    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 2.1, 8), this.matMetal);
                    post.position.set(1.6 + dx, 7.2, -0.5 + dz);
                    this.roofGroup.add(post);
                }
            }

            // Modern rooftop sun loungers
            for (let i = 0; i < 2; i++) {
                const lounger = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.16, 2.1), this.matFabric);
                lounger.position.set(-4.6 + i * 1.4, 6.45, 2.6);
                lounger.rotation.y = 0.2;
                this.roofGroup.add(lounger);
            }
        }

        // --- DETAILED OBJECT BUILDERS ---

        createSculptedCar(paintMat, glassMat) {
            const car = new THREE.Group();

            // Lower contoured sports chassis
            const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.58, 4.6), paintMat);
            lowerBody.position.y = 0.46;
            lowerBody.castShadow = true;
            car.add(lowerBody);

            // Sculpted greenhouse / tinted cabin
            const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.48, 2.6), glassMat);
            cabin.position.set(0, 0.94, -0.2);
            cabin.castShadow = true;
            car.add(cabin);

            // Metallic roof cap
            const roofCap = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.06, 2.0), paintMat);
            roofCap.position.set(0, 1.2, -0.2);
            car.add(roofCap);

            // Front LED light signature
            const headlight = new THREE.Mesh(
                new THREE.BoxGeometry(1.9, 0.09, 0.06),
                new THREE.MeshStandardMaterial({
                    color: 0xEDF7FF,
                    emissive: 0x99D5FF,
                    emissiveIntensity: 1.0
                })
            );
            headlight.position.set(0, 0.52, 2.32);
            car.add(headlight);

            // Wheels & dark alloy rims
            const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.26, 16);
            wheelGeo.rotateZ(Math.PI / 2);
            const positions = [
                [-1.05, 0.34, 1.4],
                [1.05, 0.34, 1.4],
                [-1.05, 0.34, -1.4],
                [1.05, 0.34, -1.4]
            ];
            for (let pos of positions) {
                const wheel = new THREE.Mesh(wheelGeo, this.matCarTire);
                wheel.position.set(pos[0], pos[1], pos[2]);
                wheel.castShadow = true;
                car.add(wheel);

                const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.28, 8), this.matBrass);
                rim.rotateZ(Math.PI / 2);
                rim.position.set(pos[0], pos[1], pos[2]);
                car.add(rim);
            }

            return car;
        }

        createDetailedBookcase() {
            const bookcase = new THREE.Group();
            const frame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.2, 0.55), this.matDarkWood);
            frame.castShadow = true;
            bookcase.add(frame);

            // Shelves & colorful books
            const bookColors = [0x9E7348, 0xC8A86B, 0x8C857B, 0xEAE5DC, 0x2A2928, 0x3E5A68];
            for (let row = 0; row < 4; row++) {
                const y = -0.75 + row * 0.5;
                const shelf = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.05, 0.52), this.matBrass);
                shelf.position.set(0, y, 0);
                bookcase.add(shelf);

                // Book clumps
                for (let b = 0; b < 7; b++) {
                    const c = bookColors[(row + b) % bookColors.length];
                    const book = new THREE.Mesh(
                        new THREE.BoxGeometry(0.14 + Math.random() * 0.08, 0.36 + Math.random() * 0.08, 0.38),
                        new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 })
                    );
                    book.position.set(-1.3 + b * 0.42, y + 0.2, 0.02);
                    bookcase.add(book);
                }
            }
            return bookcase;
        }

        createDetailedSofa() {
            const sofa = new THREE.Group();
            // Main seating cushion with fabric texture
            const mainBase = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.42, 1.5), this.matFabric);
            mainBase.position.set(0, 0.22, 0);
            mainBase.castShadow = true;
            sofa.add(mainBase);

            // Chaise lounge section
            const chaise = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.42, 1.9), this.matFabric);
            chaise.position.set(-1.15, 0.22, 1.7);
            chaise.castShadow = true;
            sofa.add(chaise);

            // Backrest
            const backrest = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.6, 0.38), this.matFabric);
            backrest.position.set(0, 0.6, -0.6);
            backrest.castShadow = true;
            sofa.add(backrest);

            // Throw pillows
            for (let i = 0; i < 3; i++) {
                const pillow = new THREE.Mesh(
                    new THREE.BoxGeometry(0.48, 0.48, 0.16),
                    this.matWood
                );
                pillow.position.set(-0.85 + i * 0.85, 0.6, -0.32);
                pillow.rotation.y = 0.12 * i;
                sofa.add(pillow);
            }
            return sofa;
        }

        createDetailedBed() {
            const bed = new THREE.Group();
            // Platform frame
            const frame = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.3, 3.3), this.matDarkWood);
            frame.position.y = 0.15;
            frame.castShadow = true;
            bed.add(frame);

            // Mattress with fabric texture
            const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.38, 3.0), this.matFabric);
            mattress.position.set(0, 0.48, 0.1);
            mattress.castShadow = true;
            bed.add(mattress);

            // Dark duvet folded throw
            const duvet = new THREE.Mesh(
                new THREE.BoxGeometry(2.62, 0.14, 1.6),
                new THREE.MeshStandardMaterial({ color: 0x3E3A35, roughness: 0.8 })
            );
            duvet.position.set(0, 0.68, 0.75);
            bed.add(duvet);

            // Dual pillows
            for (let x of [-0.7, 0.7]) {
                const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.2, 0.58), this.matFabric);
                pillow.position.set(x, 0.74, -0.95);
                bed.add(pillow);
            }

            // Dual bedside pedestals & glowing cube lamps
            for (let x of [-1.9, 1.9]) {
                const pedestal = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.48, 0.7), this.matDarkWood);
                pedestal.position.set(x, 0.24, -0.85);
                bed.add(pedestal);

                const lamp = new THREE.Mesh(
                    new THREE.BoxGeometry(0.28, 0.38, 0.28),
                    new THREE.MeshStandardMaterial({
                        color: 0xFFF2D5,
                        emissive: 0xFFAA44,
                        emissiveIntensity: 0.8
                    })
                );
                lamp.position.set(x, 0.67, -0.85);
                bed.add(lamp);
            }

            return bed;
        }

        createDetailedStaircase() {
            const stairs = new THREE.Group();
            const stepCount = 14;
            const stepHeight = 0.19;
            const stepDepth = 0.33;
            const stepWidth = 1.7;

            for (let i = 0; i < stepCount; i++) {
                const step = new THREE.Mesh(
                    new THREE.BoxGeometry(stepWidth, 0.085, stepDepth),
                    this.matWood
                );
                step.position.set(0, i * stepHeight, i * stepDepth);
                step.castShadow = true;
                stairs.add(step);
            }

            // Ultra-clear glass balustrade with black top handrail
            const balustrade = new THREE.Mesh(
                new THREE.BoxGeometry(0.04, 2.9, stepCount * stepDepth),
                this.matGlass
            );
            balustrade.position.set(stepWidth / 2, 1.55, (stepCount * stepDepth) / 2);
            balustrade.rotation.x = Math.atan2(stepHeight, stepDepth);
            stairs.add(balustrade);

            return stairs;
        }

        // --- SCROLL ANIMATION & EXPLOSION CONTROL ---

        setScrollProgress(p) {
            this.targetProgress = Math.max(0, Math.min(1, p));
        }

        updateExplosion(progress) {
            // Precise stage detection
            let newStage = 1;
            if (progress < 0.15) newStage = 1;      // Assembled
            else if (progress < 0.35) newStage = 2; // Roof Lifts
            else if (progress < 0.55) newStage = 3; // Walls Separate
            else if (progress < 0.78) newStage = 4; // Floors Split
            else newStage = 5;                      // Final Reveal

            if (newStage !== this.currentStage) {
                this.currentStage = newStage;
                if (typeof this.options.onStageChange === 'function') {
                    this.options.onStageChange(newStage, progress);
                }
            }

            if (typeof this.options.onProgressChange === 'function') {
                this.options.onProgressChange(progress);
            }

            // 1. Roof Group Lift (Smooth upward movement)
            const roofLift = Math.min(1, Math.max(0, (progress - 0.1) / 0.85));
            const easedRoof = this.easeOutCubic(roofLift);
            this.roofGroup.position.y = this.initialPositions.roofY + easedRoof * 8.5;

            // Extra canopy elevation within roof group
            if (this.canopyRoof) {
                this.canopyRoof.position.y = 8.25 + easedRoof * 2.5;
            }

            // 2. Upper Level Group Lift (Vertical separation between floors)
            const floorSplit = Math.min(1, Math.max(0, (progress - 0.25) / 0.7));
            const easedFloor = this.easeOutCubic(floorSplit);
            this.upperGroup.position.y = this.initialPositions.upperY + easedFloor * 4.6;

            // 3. Left & Right Cantilevered Wings (Slide horizontally outward)
            const wingSlide = Math.min(1, Math.max(0, (progress - 0.2) / 0.75));
            const easedWing = this.easeInOutQuad(wingSlide);
            this.leftWingGroup.position.x = this.initialPositions.leftWingX - easedWing * 5.4;
            this.rightWingGroup.position.x = this.initialPositions.rightWingX + easedWing * 5.4;

            // 4. Floating Exterior Wall Panels (Move further out left/right)
            const panelSlide = Math.min(1, Math.max(0, (progress - 0.18) / 0.78));
            const easedPanels = this.easeOutCubic(panelSlide);
            this.floatingPanelsGroup.position.x = this.initialPositions.floatingPanelsX + (easedPanels * 1.5);
            // Apply scale/spread to individual children
            this.floatingPanelsGroup.children.forEach((child, idx) => {
                const dir = idx < 3 ? -1 : 1;
                child.position.x = (dir * (12.0 + (idx % 3) * 1.0)) + (dir * easedPanels * 5.0);
            });

            // 5. Front Curtain Glass Façade (Moves forward)
            const glassSlide = Math.min(1, Math.max(0, (progress - 0.15) / 0.8));
            const easedGlass = this.easeOutCubic(glassSlide);
            this.frontGlassGroup.position.z = this.initialPositions.frontGlassZ + easedGlass * 4.4;

            // 6. Subterranean Group (Lowers slightly downward for maximum separation)
            const subDrop = Math.min(1, Math.max(0, (progress - 0.28) / 0.7));
            const easedSub = this.easeOutCubic(subDrop);
            this.subterraneanGroup.position.y = this.initialPositions.subterraneanY - easedSub * 3.0;

            // 7. Dynamic Camera Elevation & Framing during explosion
            const camProgress = this.easeOutCubic(progress);
            this.camera.position.x = this.initialCameraPos.x + camProgress * 4.8;
            this.camera.position.y = this.initialCameraPos.y + camProgress * 4.2;
            this.camera.position.z = this.initialCameraPos.z + camProgress * 3.8;
            this.cameraTarget.y = 3.5 + camProgress * 2.4;
        }

        // --- EASING FUNCTIONS ---
        easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        easeInOutQuad(t) {
            return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        }

        // --- INTERACTION & EVENTS ---

        bindEvents() {
            window.addEventListener('resize', () => {
                const width = this.container.clientWidth || window.innerWidth;
                const height = this.container.clientHeight || window.innerHeight;
                this.camera.aspect = width / height;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(width, height);
            });

            // Subtle mouse parallax
            window.addEventListener('mousemove', (e) => {
                if (this.isDragging) return;
                this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
                this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
            });

            // Interactive dragging / camera orbit
            const dom = this.renderer.domElement;
            dom.addEventListener('mousedown', (e) => {
                this.isDragging = true;
                this.previousMousePosition = { x: e.clientX, y: e.clientY };
            });

            window.addEventListener('mousemove', (e) => {
                if (!this.isDragging) return;
                const deltaX = e.clientX - this.previousMousePosition.x;
                const deltaY = e.clientY - this.previousMousePosition.y;

                this.orbitRotation.y += deltaX * 0.005;
                this.orbitRotation.x += deltaY * 0.005;
                this.orbitRotation.x = Math.max(-0.4, Math.min(0.6, this.orbitRotation.x));

                this.previousMousePosition = { x: e.clientX, y: e.clientY };
            });

            window.addEventListener('mouseup', () => {
                this.isDragging = false;
            });

            // Touch interaction
            dom.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    this.isDragging = true;
                    this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                }
            });

            window.addEventListener('touchmove', (e) => {
                if (!this.isDragging || e.touches.length !== 1) return;
                const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
                const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

                this.orbitRotation.y += deltaX * 0.006;
                this.orbitRotation.x += deltaY * 0.006;
                this.orbitRotation.x = Math.max(-0.4, Math.min(0.6, this.orbitRotation.x));

                this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            });

            window.addEventListener('touchend', () => {
                this.isDragging = false;
            });
        }

        resetHome() {
            this.targetProgress = 0;
            this.orbitRotation.x = 0;
            this.orbitRotation.y = 0;
            this.mouse.targetX = 0;
            this.mouse.targetY = 0;
        }

        animate() {
            requestAnimationFrame(this.animate);

            // Smooth progress interpolation (lerp)
            this.progress += (this.targetProgress - this.progress) * 0.08;
            if (Math.abs(this.targetProgress - this.progress) < 0.0005) {
                this.progress = this.targetProgress;
            }

            // Update 3D explosion transforms
            this.updateExplosion(this.progress);

            // Smooth mouse parallax lerp
            this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
            this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

            // Apply camera orbit and parallax
            if (this.houseRoot) {
                this.houseRoot.rotation.y = this.orbitRotation.y + this.mouse.x * 0.08;
                this.houseRoot.rotation.x = this.orbitRotation.x + this.mouse.y * 0.04;
            }

            this.camera.lookAt(this.cameraTarget);
            this.renderer.render(this.scene, this.camera);
        }
    }

    // Expose globally
    window.Villa3DScene = Villa3DScene;
})();
