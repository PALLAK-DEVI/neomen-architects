/**
 * NEOMEN Architects — Luxury Villa Solstice 3D Exploded Architectural Showcase
 * High-End Architectural Visualization (Three.js PBR Engine).
 * Matches the golden-hour landscape, exposed architectural concrete, dark charcoal stone slabs,
 * travertine infinity pool, and warm interior illumination of the client reference render.
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
            
            // Atmospheric golden-hour fog
            this.scene.fog = new THREE.FogExp2(0xE8D5C0, 0.0075);

            // 2. Camera setup (Classic high-angle architectural axonometric matching reference render)
            this.camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 1000);
            this.initialCameraPos = new THREE.Vector3(30, 16, 32);
            this.camera.position.copy(this.initialCameraPos);
            this.cameraTarget = new THREE.Vector3(0, 3.8, 0);
            this.camera.lookAt(this.cameraTarget);

            // 3. Renderer setup
            this.renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: false,
                powerPreference: 'high-performance'
            });
            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.28;
            this.container.appendChild(this.renderer.domElement);

            // 4. Generate Procedural PBR Textures & Environment Panorama
            this.initTextures();
            this.initEnvironment();

            // 5. Materials Setup
            this.initMaterials();

            // 6. Lighting Setup (Golden-hour natural sunlight & warm interior downlights)
            this.initLighting();

            // 7. Build Architectural Environment & Villa Model
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

            // 1. Board-Formed Architectural Concrete (Tactile timber grain + aggregate + form-tie holes)
            const canvasConcrete = document.createElement('canvas');
            canvasConcrete.width = 1024;
            canvasConcrete.height = 1024;
            const ctxC = canvasConcrete.getContext('2d');
            ctxC.fillStyle = '#E4DFD6';
            ctxC.fillRect(0, 0, 1024, 1024);

            // Subtle timber board imprint lines
            for (let y = 0; y < 1024; y += 128) {
                ctxC.fillStyle = 'rgba(165, 155, 142, 0.3)';
                ctxC.fillRect(0, y, 1024, 3);
                ctxC.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctxC.fillRect(0, y + 3, 1024, 1.5);
            }

            // Aggregate stipples
            for (let i = 0; i < 5000; i++) {
                const rx = Math.random() * 1024;
                const ry = Math.random() * 1024;
                const r = Math.random() * 2 + 0.5;
                ctxC.fillStyle = Math.random() > 0.5 ? 'rgba(130, 120, 108, 0.15)' : 'rgba(255, 255, 255, 0.25)';
                ctxC.beginPath();
                ctxC.arc(rx, ry, r, 0, Math.PI * 2);
                ctxC.fill();
            }

            // Form tie holes
            for (let y = 64; y < 1024; y += 128) {
                for (let x = 64; x < 1024; x += 256) {
                    ctxC.fillStyle = 'rgba(100, 90, 80, 0.45)';
                    ctxC.beginPath();
                    ctxC.arc(x, y, 5, 0, Math.PI * 2);
                    ctxC.fill();
                    ctxC.fillStyle = 'rgba(255, 255, 255, 0.45)';
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

            // 2. Dark Charcoal Slate / Stone for Roof Slabs
            const canvasSlate = document.createElement('canvas');
            canvasSlate.width = 1024;
            canvasSlate.height = 1024;
            const ctxS = canvasSlate.getContext('2d');
            ctxS.fillStyle = '#26282B';
            ctxS.fillRect(0, 0, 1024, 1024);

            for (let i = 0; i < 4000; i++) {
                const rx = Math.random() * 1024;
                const ry = Math.random() * 1024;
                ctxS.fillStyle = Math.random() > 0.5 ? 'rgba(55, 58, 62, 0.4)' : 'rgba(15, 16, 18, 0.35)';
                ctxS.fillRect(rx, ry, Math.random() * 8 + 2, Math.random() * 4 + 1);
            }
            const slateTex = new THREE.CanvasTexture(canvasSlate);
            slateTex.wrapS = THREE.RepeatWrapping;
            slateTex.wrapT = THREE.RepeatWrapping;
            slateTex.repeat.set(3, 3);
            this.textures.slate = slateTex;

            // 3. Architectural Warm Wood Brown Texture (1024x1024)
            const canvasWood = document.createElement('canvas');
            canvasWood.width = 1024;
            canvasWood.height = 1024;
            const ctxW = canvasWood.getContext('2d');
            // Base rich warm wood brown
            ctxW.fillStyle = '#834F29';
            ctxW.fillRect(0, 0, 1024, 1024);

            // Realistic vertical architectural wood planks & timber grain
            for (let x = 0; x < 1024; x += 16) {
                const shade = (Math.random() - 0.5) * 32;
                const r = Math.round(131 + shade);
                const g = Math.round(79 + shade * 0.7);
                const b = Math.round(41 + shade * 0.5);
                ctxW.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctxW.fillRect(x, 0, 14, 1024);
                // Subtle dark recessed groove between planks
                ctxW.fillStyle = 'rgba(38, 20, 9, 0.55)';
                ctxW.fillRect(x + 14, 0, 2, 1024);
            }

            // Fine organic wood grain lines
            for (let i = 0; i < 90; i++) {
                const y = Math.random() * 1024;
                ctxW.fillStyle = Math.random() > 0.5 ? 'rgba(54, 30, 13, 0.22)' : 'rgba(168, 110, 62, 0.25)';
                ctxW.fillRect(0, y, 1024, Math.random() * 3 + 1);
            }
            const woodTex = new THREE.CanvasTexture(canvasWood);
            woodTex.wrapS = THREE.RepeatWrapping;
            woodTex.wrapT = THREE.RepeatWrapping;
            woodTex.repeat.set(3, 1);
            this.textures.wood = woodTex;

            // 4. Refined Off-White Stone Flooring Texture (1024x1024)
            const canvasTrav = document.createElement('canvas');
            canvasTrav.width = 1024;
            canvasTrav.height = 1024;
            const ctxT = canvasTrav.getContext('2d');
            ctxT.fillStyle = '#FAF8F5'; // Luminous architectural off-white
            ctxT.fillRect(0, 0, 1024, 1024);

            for (let i = 0; i < 45; i++) {
                const y = Math.random() * 1024;
                const h = Math.random() * 20 + 4;
                ctxT.fillStyle = Math.random() > 0.5 ? 'rgba(238, 234, 226, 0.35)' : 'rgba(255, 255, 255, 0.6)';
                ctxT.fillRect(0, y, 1024, h);
            }
            // Fine architectural off-white stone joints
            ctxT.strokeStyle = 'rgba(220, 214, 204, 0.3)';
            ctxT.lineWidth = 1;
            for (let x = 0; x < 1024; x += 128) {
                ctxT.beginPath();
                ctxT.moveTo(x, 0);
                ctxT.lineTo(x, 1024);
                ctxT.stroke();
            }
            for (let y = 0; y < 1024; y += 128) {
                ctxT.beginPath();
                ctxT.moveTo(0, y);
                ctxT.lineTo(1024, y);
                ctxT.stroke();
            }
            const travTex = new THREE.CanvasTexture(canvasTrav);
            travTex.wrapS = THREE.RepeatWrapping;
            travTex.wrapT = THREE.RepeatWrapping;
            travTex.repeat.set(3, 3);
            this.textures.travertine = travTex;

            // 5. Dark Quartz Countertop
            const canvasQuartz = document.createElement('canvas');
            canvasQuartz.width = 512;
            canvasQuartz.height = 512;
            const ctxQ = canvasQuartz.getContext('2d');
            ctxQ.fillStyle = '#1E1D1C';
            ctxQ.fillRect(0, 0, 512, 512);
            for (let i = 0; i < 18; i++) {
                ctxQ.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctxQ.lineWidth = Math.random() * 1.5 + 0.5;
                ctxQ.beginPath();
                ctxQ.moveTo(Math.random() * 512, 0);
                ctxQ.bezierCurveTo(Math.random() * 512, 200, Math.random() * 512, 350, Math.random() * 512, 512);
                ctxQ.stroke();
            }
            this.textures.quartz = new THREE.CanvasTexture(canvasQuartz);
        }

        initEnvironment() {
            // Golden-Hour Horizon & Mountain Panorama Canvas
            const canvasPano = document.createElement('canvas');
            canvasPano.width = 2048;
            canvasPano.height = 1024;
            const ctxP = canvasPano.getContext('2d');

            // Sky vertical sunset gradient
            const skyGrad = ctxP.createLinearGradient(0, 0, 0, 620);
            skyGrad.addColorStop(0.0, '#364052'); // Upper twilight slate blue
            skyGrad.addColorStop(0.35, '#76626C'); // Dusky rose
            skyGrad.addColorStop(0.60, '#BF8669'); // Warm terracotta
            skyGrad.addColorStop(0.80, '#E6AB6D'); // Amber gold
            skyGrad.addColorStop(0.95, '#F5CE98'); // Sunset radiance
            skyGrad.addColorStop(1.0, '#FEE4C8'); // Low horizon champagne
            ctxP.fillStyle = skyGrad;
            ctxP.fillRect(0, 0, 2048, 620);

            // Sun glow on the right
            const sunGlow = ctxP.createRadialGradient(1650, 540, 10, 1650, 540, 480);
            sunGlow.addColorStop(0, 'rgba(255, 250, 220, 0.95)');
            sunGlow.addColorStop(0.3, 'rgba(255, 215, 140, 0.6)');
            sunGlow.addColorStop(0.7, 'rgba(235, 160, 95, 0.2)');
            sunGlow.addColorStop(1, 'rgba(235, 160, 95, 0)');
            ctxP.fillStyle = sunGlow;
            ctxP.fillRect(0, 0, 2048, 620);

            // Layer 1: Distant subtle mountain ridges (Furthest)
            ctxP.fillStyle = '#837482';
            ctxP.beginPath();
            ctxP.moveTo(0, 540);
            ctxP.bezierCurveTo(400, 480, 800, 530, 1200, 490);
            ctxP.bezierCurveTo(1500, 460, 1800, 500, 2048, 520);
            ctxP.lineTo(2048, 620);
            ctxP.lineTo(0, 620);
            ctxP.closePath();
            ctxP.fill();

            // Layer 2: Middle mountain ridge bathed in warm haze
            ctxP.fillStyle = '#735F5E';
            ctxP.beginPath();
            ctxP.moveTo(0, 570);
            ctxP.bezierCurveTo(350, 530, 700, 560, 1100, 520);
            ctxP.bezierCurveTo(1450, 495, 1750, 545, 2048, 550);
            ctxP.lineTo(2048, 620);
            ctxP.lineTo(0, 620);
            ctxP.closePath();
            ctxP.fill();

            // Layer 3: Near rolling hillside terrain with forest texture
            const hillGrad = ctxP.createLinearGradient(0, 560, 0, 1024);
            hillGrad.addColorStop(0, '#53463E');
            hillGrad.addColorStop(0.3, '#3A422D');
            hillGrad.addColorStop(1.0, '#242B1D');
            ctxP.fillStyle = hillGrad;
            ctxP.beginPath();
            ctxP.moveTo(0, 595);
            ctxP.bezierCurveTo(400, 565, 850, 580, 1300, 550);
            ctxP.bezierCurveTo(1650, 530, 1850, 570, 2048, 580);
            ctxP.lineTo(2048, 1024);
            ctxP.lineTo(0, 1024);
            ctxP.closePath();
            ctxP.fill();

            const panoTex = new THREE.CanvasTexture(canvasPano);
            panoTex.mapping = THREE.EquirectangularReflectionMapping;
            this.scene.background = panoTex;
            this.scene.environment = panoTex; // Supplies realistic reflections to all glass and metals
        }

        initMaterials() {
            // Exposed architectural concrete with subtle texture (for foundations and structural elements)
            this.matConcrete = new THREE.MeshStandardMaterial({
                color: 0xE6E2DA,
                map: this.textures.concrete,
                roughness: 0.72,
                metalness: 0.05
            });

            // Rich Architectural Wood Brown for outer house walls & exterior panels
            this.matWoodWall = new THREE.MeshStandardMaterial({
                color: 0x86522B, // Warm rich wood brown
                map: this.textures.wood,
                roughness: 0.44,
                metalness: 0.05
            });

            // Deep Architectural Wood Brown for structural outer pillars & pylons
            this.matWoodPillar = new THREE.MeshStandardMaterial({
                color: 0x764621, // Deep solid timber/walnut pillar brown
                map: this.textures.wood,
                roughness: 0.42,
                metalness: 0.06
            });

            // Dark architectural concrete for retaining walls
            this.matDarkConcrete = new THREE.MeshStandardMaterial({
                color: 0x363432,
                map: this.textures.concrete,
                roughness: 0.85,
                metalness: 0.08
            });

            // Dark charcoal stone / slate for main roof slabs
            this.matSlateRoof = new THREE.MeshStandardMaterial({
                color: 0x2A2C30,
                map: this.textures.slate,
                roughness: 0.65,
                metalness: 0.15
            });

            // Refined Architectural Off-White Stone Flooring
            this.matFloorOffWhite = new THREE.MeshStandardMaterial({
                color: 0xFAF8F5, // Luminous, pristine off-white
                map: this.textures.travertine,
                roughness: 0.32,
                metalness: 0.03
            });

            // Natural off-white travertine stone flooring & podium
            this.matTravertine = new THREE.MeshStandardMaterial({
                color: 0xFAF8F5,
                map: this.textures.travertine,
                roughness: 0.36,
                metalness: 0.03
            });

            // Warm teakwood & walnut vertical grain cladding
            this.matWood = new THREE.MeshStandardMaterial({
                color: 0x86522B,
                map: this.textures.wood,
                roughness: 0.44,
                metalness: 0.05
            });

            // Smoked dark oak for interior furniture
            this.matDarkWood = new THREE.MeshStandardMaterial({
                color: 0x48392B,
                map: this.textures.wood,
                roughness: 0.52,
                metalness: 0.05
            });

            // Floor-to-ceiling glass with realistic reflections & transparency
            this.matGlass = new THREE.MeshPhysicalMaterial ? new THREE.MeshPhysicalMaterial({
                color: 0xE2F2F8,
                transparent: true,
                opacity: 0.38,
                roughness: 0.04,
                metalness: 0.15,
                transmission: 0.84,
                ior: 1.52,
                reflectivity: 0.95
            }) : new THREE.MeshStandardMaterial({
                color: 0xE2F2F8,
                transparent: true,
                opacity: 0.35,
                roughness: 0.05,
                metalness: 0.2
            });

            // Slim black metal window frames & structural steel
            this.matMetal = new THREE.MeshStandardMaterial({
                color: 0x161514,
                roughness: 0.25,
                metalness: 0.92
            });

            // Brushed brass & bronze hardware
            this.matBrass = new THREE.MeshStandardMaterial({
                color: 0xC8A86B,
                roughness: 0.25,
                metalness: 0.92
            });

            // Warm linear LED light strip under steps
            this.matLedStrip = new THREE.MeshStandardMaterial({
                color: 0xFFE6B8,
                emissive: 0xFFAA44,
                emissiveIntensity: 1.8,
                roughness: 0.2
            });

            // Infinity pool water with sky reflections
            this.matWater = new THREE.MeshStandardMaterial({
                color: 0x427A8A,
                roughness: 0.06,
                metalness: 0.75
            });

            // Mediterranean hillside tree foliage
            this.matFoliage = new THREE.MeshStandardMaterial({
                color: 0x36482C,
                roughness: 0.85,
                metalness: 0.0
            });
            this.matTrunk = new THREE.MeshStandardMaterial({
                color: 0x3E3025,
                roughness: 0.9
            });

            // Luxury furniture fabrics
            this.matFabric = new THREE.MeshStandardMaterial({
                color: 0xEDE9E1,
                roughness: 0.92,
                metalness: 0.0
            });
            this.matQuartz = new THREE.MeshStandardMaterial({
                color: 0x222120,
                map: this.textures.quartz,
                roughness: 0.28,
                metalness: 0.18
            });

            // Automotive paints for showroom cars
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
            // Natural sky/ground hemisphere gradient
            const hemiLight = new THREE.HemisphereLight(0xFDF7EC, 0xC8B8A2, 0.65);
            this.scene.add(hemiLight);

            // Ambient fill
            const ambient = new THREE.AmbientLight(0xFFEEDB, 0.7);
            this.scene.add(ambient);

            // Golden-Hour Sun Light (Direction matches reference photo sunset angle)
            this.sunLight = new THREE.DirectionalLight(0xFFE4BC, 1.8);
            this.sunLight.position.set(32, 28, 26);
            this.sunLight.castShadow = true;
            this.sunLight.shadow.mapSize.width = 2048;
            this.sunLight.shadow.mapSize.height = 2048;
            this.sunLight.shadow.camera.near = 5;
            this.sunLight.shadow.camera.far = 110;
            const d = 26;
            this.sunLight.shadow.camera.left = -d;
            this.sunLight.shadow.camera.right = d;
            this.sunLight.shadow.camera.top = d;
            this.sunLight.shadow.camera.bottom = -d;
            this.sunLight.shadow.bias = -0.0003;
            this.scene.add(this.sunLight);

            // Secondary cool sky bounce from opposite side
            const skyBounce = new THREE.DirectionalLight(0xB2C8DE, 0.45);
            skyBounce.position.set(-28, 18, -25);
            this.scene.add(skyBounce);

            // Ground shadow catcher
            const shadowPlaneGeo = new THREE.PlaneGeometry(160, 160);
            const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.32 });
            const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
            shadowPlane.rotation.x = -Math.PI / 2;
            shadowPlane.position.y = -2.52;
            shadowPlane.receiveShadow = true;
            this.scene.add(shadowPlane);
        }

        buildHouse() {
            this.houseRoot = new THREE.Group();
            this.scene.add(this.houseRoot);

            // 1. Podium, Infinity Pool, Linear LED steps & Surrounding Trees
            this.buildPlinthAndLandscape();

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

            // 6. Right Cantilever Wing & Pylons Group (Slides right)
            this.rightWingGroup = new THREE.Group();
            this.buildRightWing();
            this.houseRoot.add(this.rightWingGroup);

            // 7. Floating Exterior Wall Panels Group (Moves out left/right)
            this.floatingPanelsGroup = new THREE.Group();
            this.buildFloatingPanels();
            this.houseRoot.add(this.floatingPanelsGroup);

            // 8. Upper Floor Group (Master Suite, Terrace, Overhang) (Lifts up)
            this.upperGroup = new THREE.Group();
            this.buildUpperLevel();
            this.houseRoot.add(this.upperGroup);

            // 9. Roof & Rooftop Garden Lounge Group (Lifts highest)
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

        // --- SECTION BUILDERS ---

        buildPlinthAndLandscape() {
            const plinthGroup = new THREE.Group();

            // Stepped travertine architectural podium
            const baseGeo = new THREE.BoxGeometry(24, 0.55, 20);
            const base = new THREE.Mesh(baseGeo, this.matTravertine);
            base.position.set(0.5, -2.2, 0.5);
            base.receiveShadow = true;
            plinthGroup.add(base);

            // Long luxury infinity pool on the left side
            const poolRim = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.4, 15.2), this.matTravertine);
            poolRim.position.set(-8.2, -2.12, 1.5);
            poolRim.receiveShadow = true;
            plinthGroup.add(poolRim);

            const poolWater = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.15, 14.6), this.matWater);
            poolWater.position.set(-8.2, -2.02, 1.5);
            poolWater.receiveShadow = true;
            plinthGroup.add(poolWater);

            // Stepped entrance platforms with warm linear LED edge lighting
            for (let i = 0; i < 4; i++) {
                const step = new THREE.Mesh(
                    new THREE.BoxGeometry(6.2 + i * 0.4, 0.14, 1.2),
                    this.matTravertine
                );
                step.position.set(0.5, -2.12 + i * 0.14, 10.2 - i * 0.9);
                step.receiveShadow = true;
                step.castShadow = true;
                plinthGroup.add(step);

                // Integrated warm LED under-step light strip
                const led = new THREE.Mesh(
                    new THREE.BoxGeometry(6.1 + i * 0.4, 0.02, 0.04),
                    this.matLedStrip
                );
                led.position.set(0.5, -2.19 + i * 0.14, 10.8 - i * 0.9);
                plinthGroup.add(led);
            }

            // Surrounding Mediterranean pines & shrubbery flanking the terrace
            const treePositions = [
                [-12.5, -2.4, -6.0], [-13.2, -2.4, 0.0], [-12.8, -2.4, 6.5], [-11.0, -2.4, 11.5],
                [13.5, -2.4, -6.5], [14.0, -2.4, 1.5], [13.2, -2.4, 7.5], [11.5, -2.4, 12.0],
                [-5.0, -2.4, 12.5], [6.0, -2.4, 12.5]
            ];
            for (let pos of treePositions) {
                const tree = this.createArchitecturalTree();
                tree.position.set(pos[0], pos[1], pos[2]);
                plinthGroup.add(tree);
            }

            this.houseRoot.add(plinthGroup);
        }

        buildSubterranean() {
            // Basement off-white floor slab
            const slab = new THREE.Mesh(new THREE.BoxGeometry(17.2, 0.45, 14.0), this.matFloorOffWhite);
            slab.position.set(0, -2.0, -0.5);
            slab.receiveShadow = true;
            this.subterraneanGroup.add(slab);

            // Rear & side retaining walls in rich wood brown
            const rearWall = new THREE.Mesh(new THREE.BoxGeometry(17.2, 2.4, 0.45), this.matWoodWall);
            rearWall.position.set(0, -0.85, -7.2);
            rearWall.castShadow = true;
            this.subterraneanGroup.add(rearWall);

            const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.45, 2.4, 14.0), this.matWoodWall);
            sideWall.position.set(-8.4, -0.85, -0.5);
            sideWall.castShadow = true;
            this.subterraneanGroup.add(sideWall);

            // Subterranean glass showroom façade with slim black mullions
            const garageGlass = new THREE.Mesh(new THREE.BoxGeometry(12.0, 2.1, 0.05), this.matGlass);
            garageGlass.position.set(-1.0, -0.9, 5.2);
            this.subterraneanGroup.add(garageGlass);

            // Structural pillars in deep wood brown timber
            for (let x of [-4.2, 3.8]) {
                const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.65, 2.4, 0.65), this.matWoodPillar);
                pillar.position.set(x, -0.85, 5.2);
                pillar.castShadow = true;
                this.subterraneanGroup.add(pillar);
            }

            // Subterranean showroom sports car 1: Dark metallic coupe
            const car1 = this.createSculptedCar(this.matCarPaintDark, this.matCarGlass);
            car1.position.set(-3.2, -1.75, 1.2);
            car1.rotation.y = -0.06;
            this.subterraneanGroup.add(car1);

            // Subterranean showroom sports car 2: Metallic silver coupe
            const car2 = this.createSculptedCar(this.matCarPaintSilver, this.matCarGlass);
            car2.position.set(2.4, -1.75, 1.5);
            car2.rotation.y = 0.08;
            this.subterraneanGroup.add(car2);

            // Built-in illuminated library / wine display
            const bookShelves = this.createDetailedBookcase();
            bookShelves.position.set(6.2, -0.85, -6.0);
            this.subterraneanGroup.add(bookShelves);

            // Warm interior downlights in subterranean showroom
            const garageLight = new THREE.PointLight(0xFFAA44, 2.2, 14);
            garageLight.position.set(-1.0, -0.4, 0.5);
            this.subterraneanGroup.add(garageLight);
        }

        buildGroundLevel() {
            // Ground floor slab in refined off-white stone
            const floorSlab = new THREE.Mesh(new THREE.BoxGeometry(18.0, 0.44, 15.0), this.matFloorOffWhite);
            floorSlab.position.set(0, 0.22, 0);
            floorSlab.receiveShadow = true;
            floorSlab.castShadow = true;
            this.groundGroup.add(floorSlab);

            // Cantilevered intermediate off-white floor slab projecting out towards the right
            const extSlab = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.35, 8.0), this.matFloorOffWhite);
            extSlab.position.set(9.0, 0.22, 1.0);
            extSlab.castShadow = true;
            extSlab.receiveShadow = true;
            this.groundGroup.add(extSlab);

            // Rear architectural wall in rich wood brown with wood panel accents
            const backWall = new THREE.Mesh(new THREE.BoxGeometry(17.4, 2.9, 0.4), this.matWoodWall);
            backWall.position.set(0, 1.75, -7.0);
            backWall.castShadow = true;
            this.groundGroup.add(backWall);

            // Teakwood vertical slat accent wall in matching wood brown
            const woodPanel = new THREE.Mesh(new THREE.BoxGeometry(7.2, 2.7, 0.12), this.matWoodWall);
            woodPanel.position.set(-3.6, 1.75, -6.75);
            this.groundGroup.add(woodPanel);

            // Architectural Living Room: Sectional sofa
            const sofa = this.createDetailedSofa();
            sofa.position.set(-3.0, 0.44, 1.8);
            this.groundGroup.add(sofa);

            // Smoked walnut coffee table & textured wool rug
            const table = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.28, 1.5), this.matDarkWood);
            table.position.set(-2.2, 0.58, 1.8);
            table.castShadow = true;
            this.groundGroup.add(table);

            const rug = new THREE.Mesh(
                new THREE.BoxGeometry(5.4, 0.02, 4.4),
                new THREE.MeshStandardMaterial({ color: 0xD4CEC3, roughness: 0.95 })
            );
            rug.position.set(-2.6, 0.45, 1.8);
            rug.receiveShadow = true;
            this.groundGroup.add(rug);

            // Monolithic kitchen island with dark quartz waterfall counter
            const island = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.05, 1.6), this.matQuartz);
            island.position.set(5.0, 0.96, -1.8);
            island.castShadow = true;
            this.groundGroup.add(island);

            // Undermount brass faucet
            const faucet = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8), this.matBrass);
            faucet.position.set(5.0, 1.62, -1.8);
            this.groundGroup.add(faucet);

            // Kitchen bar stools with brass pedestals
            for (let i = 0; i < 3; i++) {
                const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.78, 16), this.matBrass);
                stool.position.set(4.0 + i * 1.1, 0.83, -0.5);
                stool.castShadow = true;
                this.groundGroup.add(stool);
            }

            // Smoked oak dining table with chairs
            const diningTable = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 1.8), this.matDarkWood);
            diningTable.position.set(4.8, 0.96, 2.8);
            diningTable.castShadow = true;
            this.groundGroup.add(diningTable);

            // Signature Floating Teakwood Staircase
            const stairs = this.createDetailedStaircase();
            stairs.position.set(0.6, 0.44, -2.6);
            this.groundGroup.add(stairs);

            // Suspended glowing glass globe chandeliers
            for (let i = 0; i < 3; i++) {
                const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.3, 8), this.matMetal);
                rod.position.set(-2.4 + i * 1.3, 2.45, 1.8);
                this.groundGroup.add(rod);

                const globe = new THREE.Mesh(
                    new THREE.SphereGeometry(0.28, 16, 16),
                    new THREE.MeshStandardMaterial({
                        color: 0xFFF2D5,
                        emissive: 0xFFAA44,
                        emissiveIntensity: 1.1
                    })
                );
                globe.position.set(-2.4 + i * 1.3, 1.7, 1.8);
                this.groundGroup.add(globe);
            }

            // Warm interior ambient point light
            const livingLight = new THREE.PointLight(0xFFAA44, 2.5, 15);
            livingLight.position.set(-1.0, 2.4, 1.0);
            this.groundGroup.add(livingLight);
        }

        buildFrontGlass() {
            // Front double-height glass curtain wall with slim black mullions
            const glassWall = new THREE.Mesh(new THREE.BoxGeometry(11.8, 5.9, 0.06), this.matGlass);
            glassWall.position.set(0, 3.25, 7.2);
            this.frontGlassGroup.add(glassWall);

            // Slim black vertical mullions
            for (let i = -5.4; i <= 5.4; i += 2.2) {
                const vMullion = new THREE.Mesh(new THREE.BoxGeometry(0.08, 5.9, 0.14), this.matMetal);
                vMullion.position.set(i, 3.25, 7.2);
                this.frontGlassGroup.add(vMullion);
            }
            // Slim black horizontal transom bars
            for (let y of [0.4, 3.1, 6.1]) {
                const hMullion = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.08, 0.14), this.matMetal);
                hMullion.position.set(0, y, 7.2);
                this.frontGlassGroup.add(hMullion);
            }
        }

        buildLeftWing() {
            // Protruding cantilevered volume in rich wood brown (upper left study / guest volume)
            const boxFrame = new THREE.Mesh(new THREE.BoxGeometry(5.8, 3.4, 6.6), this.matWoodWall);
            boxFrame.position.set(-8.0, 4.5, 2.5);
            boxFrame.castShadow = true;
            this.leftWingGroup.add(boxFrame);

            // Recessed window cutout with dark frame & glass
            const windowGlass = new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.4, 0.05), this.matGlass);
            windowGlass.position.set(-8.0, 4.5, 5.72);
            this.leftWingGroup.add(windowGlass);

            const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.6, 0.12), this.matMetal);
            windowFrame.position.set(-8.0, 4.5, 5.7);
            this.leftWingGroup.add(windowFrame);

            // Balcony glass railing
            const railing = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.95, 0.05), this.matGlass);
            railing.position.set(-8.0, 3.3, 5.9);
            this.leftWingGroup.add(railing);
        }

        buildRightWing() {
            // Cantilevered upper right volume with rich architectural wood brown
            const woodBox = new THREE.Mesh(new THREE.BoxGeometry(5.6, 3.2, 6.2), this.matWoodWall);
            woodBox.position.set(7.8, 4.4, 2.0);
            woodBox.castShadow = true;
            this.rightWingGroup.add(woodBox);

            // Three vertical architectural timber pillars / pylons in deep wood brown
            for (let i = 0; i < 3; i++) {
                const pylon = new THREE.Mesh(new THREE.BoxGeometry(1.2, 8.8, 1.2), this.matWoodPillar);
                pylon.position.set(9.8 + i * 2.2, 2.6, 4.5 - i * 3.5);
                pylon.castShadow = true;
                this.rightWingGroup.add(pylon);
            }

            // Upper terrace glass balustrade
            const balconyGlass = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.95, 0.05), this.matGlass);
            balconyGlass.position.set(7.8, 3.3, 5.2);
            this.rightWingGroup.add(balconyGlass);
        }

        buildFloatingPanels() {
            // 6 Vertical exterior architectural panels in warm wood brown
            for (let i = 0; i < 3; i++) {
                const panel = new THREE.Mesh(
                    new THREE.BoxGeometry(0.25, 4.8, 1.8),
                    this.matWoodWall
                );
                panel.position.set(-12.4 - i * 1.0, 3.4 + (i % 2) * 0.5, 4.2 - i * 3.4);
                panel.castShadow = true;
                this.floatingPanelsGroup.add(panel);
            }

            for (let i = 0; i < 3; i++) {
                const panel = new THREE.Mesh(
                    new THREE.BoxGeometry(0.25, 4.8, 1.8),
                    this.matWoodWall
                );
                panel.position.set(12.4 + i * 1.0, 3.4 + (i % 2) * 0.5, 4.2 - i * 3.4);
                panel.castShadow = true;
                this.floatingPanelsGroup.add(panel);
            }
        }

        buildUpperLevel() {
            // Upper floor slab in refined off-white stone
            const floorSlab = new THREE.Mesh(new THREE.BoxGeometry(17.4, 0.4, 14.5), this.matFloorOffWhite);
            floorSlab.position.set(0, 3.15, 0);
            floorSlab.receiveShadow = true;
            floorSlab.castShadow = true;
            this.upperGroup.add(floorSlab);

            // Master Bedroom: King-size platform bed
            const bed = this.createDetailedBed();
            bed.position.set(4.2, 3.35, -1.8);
            this.upperGroup.add(bed);

            // Headboard vertical teakwood slat wall
            const headboardWall = new THREE.Mesh(new THREE.BoxGeometry(4.5, 2.6, 0.12), this.matWood);
            headboardWall.position.set(4.2, 4.6, -4.4);
            this.upperGroup.add(headboardWall);

            // Walkway glass balustrade overlooking double-height living room
            const walkwayRail = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.95, 0.05), this.matGlass);
            walkwayRail.position.set(0, 3.8, 0.6);
            this.upperGroup.add(walkwayRail);

            // Upper warm interior point lights
            const suiteLight = new THREE.PointLight(0xFFAA44, 2.0, 12);
            suiteLight.position.set(4.0, 5.0, -1.6);
            this.upperGroup.add(suiteLight);
        }

        buildRoofLevel() {
            // Main flat roof slab in dark charcoal stone / slate with warm wood soffit underneath
            const mainRoof = new THREE.Mesh(new THREE.BoxGeometry(19.0, 0.45, 16.0), this.matSlateRoof);
            mainRoof.position.set(0, 6.2, 0.2);
            mainRoof.castShadow = true;
            this.roofGroup.add(mainRoof);

            // Warm teakwood ceiling soffit underneath the roof cantilever
            const woodSoffit = new THREE.Mesh(new THREE.BoxGeometry(18.8, 0.08, 15.8), this.matWood);
            woodSoffit.position.set(0, 5.94, 0.2);
            this.roofGroup.add(woodSoffit);

            // Rooftop garden cutout & terrace lounge (matching reference image)
            const loungeSofa = this.createRooftopLoungeSofa();
            loungeSofa.position.set(1.8, 6.45, 0.5);
            this.roofGroup.add(loungeSofa);

            // Rooftop miniature olive trees & planter boxes
            const planterPositions = [
                [-3.5, 6.45, -2.5], [-3.5, 6.45, 2.5], [6.5, 6.45, -2.5], [6.5, 6.45, 2.5]
            ];
            for (let pos of planterPositions) {
                const planter = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 1.4), this.matWoodWall);
                planter.position.set(pos[0], pos[1] + 0.22, pos[2]);
                planter.castShadow = true;
                this.roofGroup.add(planter);

                const miniTree = this.createMiniTree();
                miniTree.position.set(pos[0], pos[1] + 0.45, pos[2]);
                this.roofGroup.add(miniTree);
            }

            // Floating elevated thin canopy roof supported by 4 slender steel posts
            this.canopyRoof = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.28, 8.2), this.matSlateRoof);
            this.canopyRoof.position.set(1.8, 8.4, 0.5);
            this.canopyRoof.castShadow = true;
            this.roofGroup.add(this.canopyRoof);

            for (let dx of [-4.5, 4.5]) {
                for (let dz of [-3.3, 3.3]) {
                    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 2.2, 8), this.matMetal);
                    post.position.set(1.8 + dx, 7.3, 0.5 + dz);
                    this.roofGroup.add(post);
                }
            }
        }

        // --- DETAILED OBJECT BUILDERS ---

        createArchitecturalTree() {
            const tree = new THREE.Group();
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.2, 8), this.matTrunk);
            trunk.position.y = 1.1;
            trunk.castShadow = true;
            tree.add(trunk);

            // Layered foliage cones
            for (let i = 0; i < 3; i++) {
                const cone = new THREE.Mesh(
                    new THREE.ConeGeometry(1.2 - i * 0.25, 1.5, 8),
                    this.matFoliage
                );
                cone.position.y = 2.0 + i * 0.8;
                cone.castShadow = true;
                tree.add(cone);
            }
            return tree;
        }

        createMiniTree() {
            const tree = new THREE.Group();
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.8, 8), this.matTrunk);
            trunk.position.y = 0.4;
            tree.add(trunk);

            const foliage = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), this.matFoliage);
            foliage.position.y = 0.9;
            foliage.castShadow = true;
            tree.add(foliage);
            return tree;
        }

        createRooftopLoungeSofa() {
            const lounge = new THREE.Group();
            // U-shaped luxury outdoor lounge seating
            const backCushion = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.5, 0.4), this.matFabric);
            backCushion.position.set(0, 0.5, -1.4);
            lounge.add(backCushion);

            const leftCushion = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 2.8), this.matFabric);
            leftCushion.position.set(-1.9, 0.5, 0);
            lounge.add(leftCushion);

            const rightCushion = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 2.8), this.matFabric);
            rightCushion.position.set(1.9, 0.5, 0);
            lounge.add(rightCushion);

            const baseSofa = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.3, 2.6), this.matFabric);
            baseSofa.position.set(0, 0.15, 0);
            baseSofa.castShadow = true;
            lounge.add(baseSofa);

            const centerTable = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.22, 1.4), this.matDarkWood);
            centerTable.position.set(0, 0.25, 0);
            lounge.add(centerTable);
            return lounge;
        }

        createSculptedCar(paintMat, glassMat) {
            const car = new THREE.Group();
            // Sculpted sports chassis
            const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.58, 4.6), paintMat);
            lowerBody.position.y = 0.46;
            lowerBody.castShadow = true;
            car.add(lowerBody);

            // Aerodynamic greenhouse
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
                    emissiveIntensity: 1.2
                })
            );
            headlight.position.set(0, 0.52, 2.32);
            car.add(headlight);

            // Spoked alloy wheels
            const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.26, 16);
            wheelGeo.rotateZ(Math.PI / 2);
            const positions = [
                [-1.05, 0.34, 1.4], [1.05, 0.34, 1.4],
                [-1.05, 0.34, -1.4], [1.05, 0.34, -1.4]
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

            const bookColors = [0x9E7348, 0xC8A86B, 0x8C857B, 0xEAE5DC, 0x2A2928, 0x3E5A68];
            for (let row = 0; row < 4; row++) {
                const y = -0.75 + row * 0.5;
                const shelf = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.05, 0.52), this.matBrass);
                shelf.position.set(0, y, 0);
                bookcase.add(shelf);

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
            const mainBase = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.42, 1.5), this.matFabric);
            mainBase.position.set(0, 0.22, 0);
            mainBase.castShadow = true;
            sofa.add(mainBase);

            const chaise = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.42, 1.9), this.matFabric);
            chaise.position.set(-1.15, 0.22, 1.7);
            chaise.castShadow = true;
            sofa.add(chaise);

            const backrest = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.6, 0.38), this.matFabric);
            backrest.position.set(0, 0.6, -0.6);
            backrest.castShadow = true;
            sofa.add(backrest);

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
            const frame = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.3, 3.3), this.matDarkWood);
            frame.position.y = 0.15;
            frame.castShadow = true;
            bed.add(frame);

            const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.38, 3.0), this.matFabric);
            mattress.position.set(0, 0.48, 0.1);
            mattress.castShadow = true;
            bed.add(mattress);

            const duvet = new THREE.Mesh(
                new THREE.BoxGeometry(2.62, 0.14, 1.6),
                new THREE.MeshStandardMaterial({ color: 0x3E3A35, roughness: 0.8 })
            );
            duvet.position.set(0, 0.68, 0.75);
            bed.add(duvet);

            for (let x of [-0.7, 0.7]) {
                const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.2, 0.58), this.matFabric);
                pillow.position.set(x, 0.74, -0.95);
                bed.add(pillow);
            }

            for (let x of [-1.9, 1.9]) {
                const pedestal = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.48, 0.7), this.matDarkWood);
                pedestal.position.set(x, 0.24, -0.85);
                bed.add(pedestal);

                const lamp = new THREE.Mesh(
                    new THREE.BoxGeometry(0.28, 0.38, 0.28),
                    new THREE.MeshStandardMaterial({
                        color: 0xFFF2D5,
                        emissive: 0xFFAA44,
                        emissiveIntensity: 0.9
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
            let newStage = 1;
            if (progress < 0.15) newStage = 1;
            else if (progress < 0.35) newStage = 2;
            else if (progress < 0.55) newStage = 3;
            else if (progress < 0.78) newStage = 4;
            else newStage = 5;

            if (newStage !== this.currentStage) {
                this.currentStage = newStage;
                if (typeof this.options.onStageChange === 'function') {
                    this.options.onStageChange(newStage, progress);
                }
            }

            if (typeof this.options.onProgressChange === 'function') {
                this.options.onProgressChange(progress);
            }

            // 1. Roof Group Lift
            const roofLift = Math.min(1, Math.max(0, (progress - 0.1) / 0.85));
            const easedRoof = this.easeOutCubic(roofLift);
            this.roofGroup.position.y = this.initialPositions.roofY + easedRoof * 8.5;

            if (this.canopyRoof) {
                this.canopyRoof.position.y = 8.4 + easedRoof * 2.5;
            }

            // 2. Upper Level Group Lift
            const floorSplit = Math.min(1, Math.max(0, (progress - 0.25) / 0.7));
            const easedFloor = this.easeOutCubic(floorSplit);
            this.upperGroup.position.y = this.initialPositions.upperY + easedFloor * 4.6;

            // 3. Left & Right Cantilevered Wings
            const wingSlide = Math.min(1, Math.max(0, (progress - 0.2) / 0.75));
            const easedWing = this.easeInOutQuad(wingSlide);
            this.leftWingGroup.position.x = this.initialPositions.leftWingX - easedWing * 5.4;
            this.rightWingGroup.position.x = this.initialPositions.rightWingX + easedWing * 5.4;

            // 4. Floating Exterior Wall Panels
            const panelSlide = Math.min(1, Math.max(0, (progress - 0.18) / 0.78));
            const easedPanels = this.easeOutCubic(panelSlide);
            this.floatingPanelsGroup.position.x = this.initialPositions.floatingPanelsX + (easedPanels * 1.5);
            this.floatingPanelsGroup.children.forEach((child, idx) => {
                const dir = idx < 3 ? -1 : 1;
                child.position.x = (dir * (12.4 + (idx % 3) * 1.0)) + (dir * easedPanels * 5.0);
            });

            // 5. Front Curtain Glass Façade
            const glassSlide = Math.min(1, Math.max(0, (progress - 0.15) / 0.8));
            const easedGlass = this.easeOutCubic(glassSlide);
            this.frontGlassGroup.position.z = this.initialPositions.frontGlassZ + easedGlass * 4.4;

            // 6. Subterranean Group
            const subDrop = Math.min(1, Math.max(0, (progress - 0.28) / 0.7));
            const easedSub = this.easeOutCubic(subDrop);
            this.subterraneanGroup.position.y = this.initialPositions.subterraneanY - easedSub * 3.0;

            // 7. Dynamic Camera Elevation & Framing during explosion
            const camProgress = this.easeOutCubic(progress);
            this.camera.position.x = this.initialCameraPos.x + camProgress * 4.8;
            this.camera.position.y = this.initialCameraPos.y + camProgress * 4.2;
            this.camera.position.z = this.initialCameraPos.z + camProgress * 3.8;
            this.cameraTarget.y = 3.8 + camProgress * 2.4;
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

            window.addEventListener('mousemove', (e) => {
                if (this.isDragging) return;
                this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
                this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
            });

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

            this.progress += (this.targetProgress - this.progress) * 0.08;
            if (Math.abs(this.targetProgress - this.progress) < 0.0005) {
                this.progress = this.targetProgress;
            }

            this.updateExplosion(this.progress);

            this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
            this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

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
