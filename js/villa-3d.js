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
            
            // Atmospheric soft champagne golden-hour fog
            this.scene.fog = new THREE.FogExp2(0xE0DCD0, 0.0072);

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
            this.renderer.toneMappingExposure = 1.24;
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

            // 9. Initial Responsive Camera & Model Framing
            this.updateResponsiveCamera();

            // 10. Start Render Loop
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

            // 3. Architectural Honey-Teak Wood Texture (1024x1024)
            const canvasWood = document.createElement('canvas');
            canvasWood.width = 1024;
            canvasWood.height = 1024;
            const ctxW = canvasWood.getContext('2d');
            // Base luminous honey-teak / warm amber cedar
            ctxW.fillStyle = '#C47A3A';
            ctxW.fillRect(0, 0, 1024, 1024);

            // Realistic vertical architectural timber planks & grain
            for (let x = 0; x < 1024; x += 16) {
                const shade = (Math.random() - 0.5) * 28;
                const r = Math.round(196 + shade);
                const g = Math.round(122 + shade * 0.7);
                const b = Math.round(58 + shade * 0.45);
                ctxW.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctxW.fillRect(x, 0, 14, 1024);
                // Subtle dark amber recessed groove between timber slats
                ctxW.fillStyle = 'rgba(74, 38, 12, 0.45)';
                ctxW.fillRect(x + 14, 0, 2, 1024);
            }

            // Fine organic wood grain lines
            for (let i = 0; i < 90; i++) {
                const y = Math.random() * 1024;
                ctxW.fillStyle = Math.random() > 0.5 ? 'rgba(84, 45, 16, 0.22)' : 'rgba(235, 165, 95, 0.28)';
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

            // 5. Vibrant Light-Green Architectural Lawn Texture (1024x1024)
            const canvasMeadow = document.createElement('canvas');
            canvasMeadow.width = 1024;
            canvasMeadow.height = 1024;
            const ctxM = canvasMeadow.getContext('2d');
            // Luminous fresh sunlit light-green base
            ctxM.fillStyle = '#9BD866';
            ctxM.fillRect(0, 0, 1024, 1024);

            // Clean architectural manicured turf stripes (lawn mower sod bands)
            for (let x = 0; x < 1024; x += 96) {
                ctxM.fillStyle = ((x / 96) % 2 === 0) ? 'rgba(142, 212, 86, 0.35)' : 'rgba(172, 238, 118, 0.35)';
                ctxM.fillRect(x, 0, 96, 1024);
            }

            // High-density organic grass blades and fine turf needles
            for (let i = 0; i < 16000; i++) {
                const gx = Math.random() * 1024;
                const gy = Math.random() * 1024;
                const gh = Math.random() * 9 + 3;
                const slant = (Math.random() - 0.5) * 4;
                const colors = ['#A8EA6E', '#B8F280', '#88CE52', '#76B842', '#C6F692', '#94D85C'];
                ctxM.strokeStyle = colors[Math.floor(Math.random() * colors.length)];
                ctxM.lineWidth = Math.random() > 0.65 ? 1.5 : 1.0;
                ctxM.beginPath();
                ctxM.moveTo(gx, gy);
                ctxM.lineTo(gx + slant, gy - gh);
                ctxM.stroke();
            }

            // Micro turf texture stipples
            for (let i = 0; i < 8000; i++) {
                const sx = Math.random() * 1024;
                const sy = Math.random() * 1024;
                ctxM.fillStyle = Math.random() > 0.5 ? 'rgba(215, 252, 160, 0.45)' : 'rgba(92, 150, 48, 0.3)';
                ctxM.fillRect(sx, sy, Math.random() * 3 + 1, Math.random() * 3 + 1);
            }

            const meadowTex = new THREE.CanvasTexture(canvasMeadow);
            meadowTex.wrapS = THREE.RepeatWrapping;
            meadowTex.wrapT = THREE.RepeatWrapping;
            meadowTex.repeat.set(22, 22);
            this.textures.meadow = meadowTex;

            // 6. Architectural Pine / Spruce Foliage Texture (512x512)
            const canvasFoliage = document.createElement('canvas');
            canvasFoliage.width = 512;
            canvasFoliage.height = 512;
            const ctxF = canvasFoliage.getContext('2d');
            ctxF.fillStyle = '#486834'; // Deep alpine conifer green
            ctxF.fillRect(0, 0, 512, 512);

            // Horizontal foliage tier shadows and needle bands
            for (let y = 0; y < 512; y += 16) {
                ctxF.fillStyle = 'rgba(28, 42, 20, 0.45)';
                ctxF.fillRect(0, y, 512, 5);
                ctxF.fillStyle = 'rgba(128, 172, 92, 0.35)';
                ctxF.fillRect(0, y + 5, 512, 3);
            }

            // Fine pine needles
            for (let i = 0; i < 10000; i++) {
                const fx = Math.random() * 512;
                const fy = Math.random() * 512;
                const flen = Math.random() * 8 + 3;
                const fCol = ['#5E8442', '#729E52', '#86B662', '#3A5428', '#A2CE7E'];
                ctxF.strokeStyle = fCol[Math.floor(Math.random() * fCol.length)];
                ctxF.lineWidth = 1;
                ctxF.beginPath();
                ctxF.moveTo(fx, fy);
                ctxF.lineTo(fx + (Math.random() - 0.5) * 5, fy + flen);
                ctxF.stroke();
            }
            const foliageTex = new THREE.CanvasTexture(canvasFoliage);
            foliageTex.wrapS = THREE.RepeatWrapping;
            foliageTex.wrapT = THREE.RepeatWrapping;
            foliageTex.repeat.set(3, 3);
            this.textures.foliage = foliageTex;

            // 7. Dark Quartz Countertop
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
            // Soft Champagne Daylight Horizon & Rolling Misty Hills Panorama
            const canvasPano = document.createElement('canvas');
            canvasPano.width = 2048;
            canvasPano.height = 1024;
            const ctxP = canvasPano.getContext('2d');

            // Sky vertical soft champagne daylight gradient
            const skyGrad = ctxP.createLinearGradient(0, 0, 0, 620);
            skyGrad.addColorStop(0.0, '#C2C9BA'); // Pale silver-sage upper daylight sky
            skyGrad.addColorStop(0.35, '#D5DACD'); // Light misty sage champagne
            skyGrad.addColorStop(0.65, '#E4DFD3'); // Soft warm champagne ambiance
            skyGrad.addColorStop(0.85, '#EFEAE0'); // Luminous daylight radiance
            skyGrad.addColorStop(1.0, '#FAF6ED'); // Horizon pale champagne light
            ctxP.fillStyle = skyGrad;
            ctxP.fillRect(0, 0, 2048, 620);

            // Sun glow in upper right matching reference lighting
            const sunGlow = ctxP.createRadialGradient(1620, 480, 10, 1620, 480, 500);
            sunGlow.addColorStop(0, 'rgba(255, 250, 230, 0.90)');
            sunGlow.addColorStop(0.3, 'rgba(250, 230, 185, 0.45)');
            sunGlow.addColorStop(0.7, 'rgba(235, 215, 175, 0.15)');
            sunGlow.addColorStop(1, 'rgba(235, 215, 175, 0)');
            ctxP.fillStyle = sunGlow;
            ctxP.fillRect(0, 0, 2048, 620);

            // Layer 1: Distant soft sage-gray mountain ridge
            ctxP.fillStyle = '#ACB29F';
            ctxP.beginPath();
            ctxP.moveTo(0, 535);
            ctxP.bezierCurveTo(400, 475, 800, 525, 1200, 485);
            ctxP.bezierCurveTo(1500, 455, 1800, 495, 2048, 515);
            ctxP.lineTo(2048, 620);
            ctxP.lineTo(0, 620);
            ctxP.closePath();
            ctxP.fill();

            // Layer 2: Middle rolling hills in soft olive-sage
            ctxP.fillStyle = '#97A287';
            ctxP.beginPath();
            ctxP.moveTo(0, 565);
            ctxP.bezierCurveTo(350, 525, 700, 555, 1100, 515);
            ctxP.bezierCurveTo(1450, 490, 1750, 540, 2048, 545);
            ctxP.lineTo(2048, 620);
            ctxP.lineTo(0, 620);
            ctxP.closePath();
            ctxP.fill();

            // Layer 3: Near rolling hillside meadow terrain in sunlit light green
            const hillGrad = ctxP.createLinearGradient(0, 560, 0, 1024);
            hillGrad.addColorStop(0, '#86B064'); // Light green rolling hillcrest
            hillGrad.addColorStop(0.35, '#729C52'); // Lush meadow hillside
            hillGrad.addColorStop(1.0, '#4E7436'); // Deep forest base
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

            // Luminous Architectural Honey-Teak Wood for outer house walls & exterior panels
            this.matWoodWall = new THREE.MeshStandardMaterial({
                color: 0xC57C3D, // Warm vibrant honey-teak / amber cedar
                map: this.textures.wood,
                roughness: 0.40,
                metalness: 0.04
            });

            // Solid Honey-Teak / Amber Cedar Timber for structural outer pillars & pylons
            this.matWoodPillar = new THREE.MeshStandardMaterial({
                color: 0xB87032, // Solid warm honey-teak timber pillar
                map: this.textures.wood,
                roughness: 0.38,
                metalness: 0.05
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
                color: 0x24262A,
                map: this.textures.slate,
                roughness: 0.65,
                metalness: 0.15
            });

            // Refined Architectural Off-White Stone Flooring
            this.matFloorOffWhite = new THREE.MeshStandardMaterial({
                color: 0xF7F5EF, // Luminous, pristine architectural off-white
                map: this.textures.travertine,
                roughness: 0.30,
                metalness: 0.03
            });

            // Natural off-white travertine stone flooring & podium
            this.matTravertine = new THREE.MeshStandardMaterial({
                color: 0xF5F3EC,
                map: this.textures.travertine,
                roughness: 0.35,
                metalness: 0.03
            });

            // Warm honey-teak vertical grain cladding
            this.matWood = new THREE.MeshStandardMaterial({
                color: 0xC57C3D,
                map: this.textures.wood,
                roughness: 0.40,
                metalness: 0.04
            });

            // Smoked dark oak for interior furniture
            this.matDarkWood = new THREE.MeshStandardMaterial({
                color: 0x48392B,
                map: this.textures.wood,
                roughness: 0.52,
                metalness: 0.05
            });

            // Vibrant light-green natural lawn with rich surface texture
            this.matMeadow = new THREE.MeshStandardMaterial({
                color: 0xFFFFFF, // Full 100% luminous brightness so the light green texture shines
                map: this.textures.meadow,
                roughness: 0.72,
                metalness: 0.0
            });

            // Floor-to-ceiling glass with realistic reflections & transparency
            this.matGlass = new THREE.MeshPhysicalMaterial ? new THREE.MeshPhysicalMaterial({
                color: 0xE6F2F5,
                transparent: true,
                opacity: 0.35,
                roughness: 0.04,
                metalness: 0.15,
                transmission: 0.85,
                ior: 1.52,
                reflectivity: 0.95
            }) : new THREE.MeshStandardMaterial({
                color: 0xE6F2F5,
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
                color: 0x3E7888,
                roughness: 0.06,
                metalness: 0.75
            });

            // Architectural conifer evergreen pine foliage with needle texture
            this.matFoliage = new THREE.MeshStandardMaterial({
                color: 0x6E9252, // Healthy architectural pine foliage matching reference
                map: this.textures.foliage,
                roughness: 0.68,
                metalness: 0.0
            });

            // Sunlit flared skirt edge rim for tree cone tiers
            this.matFoliageRim = new THREE.MeshStandardMaterial({
                color: 0x90B86C, // Sunlit conifer needle tips on tier skirts
                map: this.textures.foliage,
                roughness: 0.62,
                metalness: 0.0
            });

            this.matTrunk = new THREE.MeshStandardMaterial({
                color: 0x423022,
                roughness: 0.88
            });

            // Landscape river stones & gravel
            this.matRock = new THREE.MeshStandardMaterial({
                color: 0x8A887E,
                roughness: 0.78,
                metalness: 0.05
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

            // Natural soft sage meadow grass ground plane surrounding the villa
            const meadowGeo = new THREE.PlaneGeometry(160, 160);
            const meadow = new THREE.Mesh(meadowGeo, this.matMeadow);
            meadow.rotation.x = -Math.PI / 2;
            meadow.position.y = -2.48;
            meadow.receiveShadow = true;
            plinthGroup.add(meadow);

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

            // Decorative organic landscape river stones around the plinth edges
            const rockGeo = new THREE.DodecahedronGeometry(0.35, 1);
            const rockPositions = [
                [-10.5, -2.35, 10.0, 1.2], [-9.8, -2.38, 10.5, 0.8], [-10.8, -2.4, 9.4, 0.6],
                [9.5, -2.35, 10.2, 1.1], [10.2, -2.38, 9.8, 0.75], [9.1, -2.4, 10.8, 0.65],
                [-6.2, -2.4, 11.2, 0.9], [-5.6, -2.42, 11.6, 0.55],
                [5.2, -2.4, 11.4, 0.85], [5.9, -2.42, 11.8, 0.5]
            ];
            for (let r of rockPositions) {
                const rock = new THREE.Mesh(rockGeo, this.matRock);
                rock.scale.set(r[3], r[3] * 0.7, r[3]);
                rock.position.set(r[0], r[1], r[2]);
                rock.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
                rock.castShadow = true;
                rock.receiveShadow = true;
                plinthGroup.add(rock);
            }

            // Surrounding stylized architectural spruce/pine trees matching reference render
            const treePositions = [
                // Front lawn edge
                [-7.5, -2.48, 10.2, 1.05],
                [-2.8, -2.48, 11.5, 0.92],
                [2.8, -2.48, 11.8, 0.95],
                [7.8, -2.48, 10.5, 1.02],
                // Left pool terrace perimeter
                [-12.5, -2.48, -4.0, 1.15],
                [-13.2, -2.48, 2.5, 1.08],
                [-12.2, -2.48, 8.0, 0.98],
                [-11.2, -2.48, 11.8, 0.88],
                // Right timber pylon perimeter
                [13.5, -2.48, -2.0, 1.12],
                [13.8, -2.48, 5.0, 1.05],
                [11.8, -2.48, 9.8, 0.96],
                // Rear backdrop
                [-6.5, -2.48, -9.5, 1.2],
                [6.0, -2.48, -9.5, 1.18]
            ];
            for (let pos of treePositions) {
                const tree = this.createArchitecturalTree(pos[3] || 1.0);
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
            // Cantilevered upper right volume with warm honey-teak wood
            const woodBox = new THREE.Mesh(new THREE.BoxGeometry(5.6, 3.2, 6.2), this.matWoodWall);
            woodBox.position.set(7.8, 4.4, 2.0);
            woodBox.castShadow = true;
            this.rightWingGroup.add(woodBox);

            // Rhythmic architectural timber pillars / vertical screen in warm honey-teakwood
            for (let i = 0; i < 4; i++) {
                const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.85, 8.8, 0.85), this.matWoodPillar);
                pylon.position.set(9.6 + i * 1.6, 2.6, 4.2 - i * 2.8);
                pylon.castShadow = true;
                pylon.receiveShadow = true;
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

        createArchitecturalTree(scale = 1.0) {
            const tree = new THREE.Group();
            tree.scale.setScalar(scale);

            // Slender pine trunk
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.15, 1.6, 8), this.matTrunk);
            trunk.position.y = 0.8;
            trunk.castShadow = true;
            tree.add(trunk);

            // 4 overlapping flared conical tiers matching the architectural rendering in reference image
            const tiers = [
                { r: 1.30, h: 1.15, y: 1.35 },
                { r: 1.05, h: 1.05, y: 2.10 },
                { r: 0.80, h: 0.95, y: 2.80 },
                { r: 0.54, h: 0.85, y: 3.40 }
            ];

            for (let t of tiers) {
                const cone = new THREE.Mesh(
                    new THREE.ConeGeometry(t.r, t.h, 12),
                    this.matFoliage
                );
                cone.position.y = t.y;
                cone.castShadow = true;
                cone.receiveShadow = true;
                tree.add(cone);

                // Flared sunlit rim ring at the base of each skirt tier
                const rim = new THREE.Mesh(
                    new THREE.CylinderGeometry(t.r * 1.015, t.r * 1.015, 0.07, 12, 1, true),
                    this.matFoliageRim
                );
                rim.position.y = t.y - (t.h / 2) + 0.035;
                rim.castShadow = true;
                tree.add(rim);
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

            // 7. Stable Camera Framing: The viewing angle remains fixed throughout scrolling.
            // Scroll progress exclusively drives the architectural component explosion without tilting or shifting.
        }

        // --- RESPONSIVE CAMERA & MOBILE COMPOSITION ---
        updateResponsiveCamera() {
            if (!this.container || !this.camera || !this.renderer) return;

            const width = this.container.clientWidth || window.innerWidth;
            const height = this.container.clientHeight || window.innerHeight;
            const aspect = width / height;

            this.camera.aspect = aspect;

            if (aspect < 0.75) {
                // Mobile Portrait (e.g. 375x812, 390x844, 430x932)
                // Optimal scale ensuring assembled villa is ~45% width, exploded villa is ~76% width
                const mobileScale = Math.min(0.40, Math.max(0.34, aspect * 0.85));
                if (this.houseRoot) {
                    this.houseRoot.scale.setScalar(mobileScale);
                    this.houseRoot.rotation.set(0, 0, 0);
                }
                this.camera.fov = 38;
                // Target positioned to center the house in the visible window between top nav and bottom HUD
                this.cameraTarget.set(0.2, 2.0, 0);
                // Distance multiplier along exact axonometric line of sight
                const distMult = 1.45;
                this.camera.position.set(30 * distMult, 2.0 + 12.2 * distMult, 32 * distMult);
            } else if (aspect < 1.15) {
                // Tablet portrait / square viewports (e.g. 768x1024, iPad portrait)
                const tabletScale = 0.54;
                if (this.houseRoot) {
                    this.houseRoot.scale.setScalar(tabletScale);
                    this.houseRoot.rotation.set(0, 0, 0);
                }
                this.camera.fov = 36;
                this.cameraTarget.set(0, 3.0, 0);
                const distMult = 1.25;
                this.camera.position.set(30 * distMult, 3.0 + 12.2 * distMult, 32 * distMult);
            } else {
                // Desktop / Landscape
                const landscapeScale = height < 520 ? 0.78 : 1.0;
                if (this.houseRoot) {
                    this.houseRoot.scale.setScalar(landscapeScale);
                }
                this.camera.fov = 34;
                this.cameraTarget.set(0, 3.8, 0);
                const distMult = 1.05;
                this.camera.position.set(30 * distMult, 3.8 + 12.2 * distMult, 32 * distMult);
            }

            this.camera.updateProjectionMatrix();
            this.camera.lookAt(this.cameraTarget);
            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
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
            const handleResize = () => {
                this.updateResponsiveCamera();
            };
            window.addEventListener('resize', handleResize);
            window.addEventListener('orientationchange', () => {
                setTimeout(handleResize, 100);
            });

            const dom = this.renderer.domElement;
            dom.style.touchAction = 'pan-y';

            // Only bind mouse drag & hover parallax on desktop with a fine pointer (mouse)
            const hasFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

            if (hasFinePointer) {
                window.addEventListener('mousemove', (e) => {
                    if (this.isDragging) return;
                    this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
                    this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
                });

                dom.addEventListener('mousedown', (e) => {
                    if (e.button !== 0) return;
                    this.isDragging = true;
                    this.previousMousePosition = { x: e.clientX, y: e.clientY };
                });

                window.addEventListener('mousemove', (e) => {
                    if (!this.isDragging) return;
                    const deltaX = e.clientX - this.previousMousePosition.x;
                    const deltaY = e.clientY - this.previousMousePosition.y;

                    this.orbitRotation.y += deltaX * 0.003;
                    this.orbitRotation.x += deltaY * 0.003;
                    this.orbitRotation.x = Math.max(-0.25, Math.min(0.35, this.orbitRotation.x));

                    this.previousMousePosition = { x: e.clientX, y: e.clientY };
                });

                window.addEventListener('mouseup', () => {
                    this.isDragging = false;
                });
            }
        }

        resetHome() {
            this.targetProgress = 0;
            this.progress = 0;
            this.orbitRotation.x = 0;
            this.orbitRotation.y = 0;
            this.mouse.targetX = 0;
            this.mouse.targetY = 0;
            this.mouse.x = 0;
            this.mouse.y = 0;
            if (this.houseRoot) {
                this.houseRoot.rotation.set(0, 0, 0);
            }
            this.updateResponsiveCamera();
            this.updateExplosion(0);
        }

        animate() {
            requestAnimationFrame(this.animate);

            const isMobileOrTouch = window.innerWidth < 768 || (this.camera && this.camera.aspect < 1.0) || (('ontouchstart' in window) && !window.matchMedia('(pointer: fine)').matches);
            const lerpSpeed = isMobileOrTouch ? 0.12 : 0.08;

            this.progress += (this.targetProgress - this.progress) * lerpSpeed;
            if (Math.abs(this.targetProgress - this.progress) < 0.0004) {
                this.progress = this.targetProgress;
            }

            this.updateExplosion(this.progress);

            if (isMobileOrTouch) {
                // Rock-solid locked viewing angle on mobile devices: zero tilting, zero rotation
                if (this.houseRoot) {
                    this.houseRoot.rotation.x = 0;
                    this.houseRoot.rotation.y = 0;
                }
            } else {
                this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
                this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

                if (this.houseRoot) {
                    this.houseRoot.rotation.y = this.orbitRotation.y + this.mouse.x * 0.025;
                    this.houseRoot.rotation.x = this.orbitRotation.x + this.mouse.y * 0.012;
                }
            }

            this.camera.lookAt(this.cameraTarget);
            this.renderer.render(this.scene, this.camera);
        }
    }

    // Expose globally
    window.Villa3DScene = Villa3DScene;
})();
