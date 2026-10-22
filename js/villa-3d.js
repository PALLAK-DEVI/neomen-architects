/**
 * NEOMEN Architects — Luxury Villa Solstice 3D Exploded Architectural Showcase
 * Pure Three.js implementation matching client reference storyboard.
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
            this.scene.background = new THREE.Color(0xF7F5F0); // Warm alabaster studio backdrop
            this.scene.fog = new THREE.FogExp2(0xF7F5F0, 0.015);

            // 2. Camera setup (Classic 3/4 architectural axonometric perspective)
            this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
            this.initialCameraPos = new THREE.Vector3(26, 14, 28);
            this.camera.position.copy(this.initialCameraPos);
            this.cameraTarget = new THREE.Vector3(0, 3.2, 0);
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
            this.renderer.toneMappingExposure = 1.15;
            this.container.appendChild(this.renderer.domElement);

            // 4. Architectural Materials Library
            this.initMaterials();

            // 5. Lighting Setup
            this.initLighting();

            // 6. Build Modular House
            this.buildHouse();

            // 7. Event Listeners
            this.bindEvents();

            // 8. Start Render Loop
            this.animate = this.animate.bind(this);
            requestAnimationFrame(this.animate);
        }

        initMaterials() {
            // Off-white concrete (smooth travertine/board-formed)
            this.matConcrete = new THREE.MeshStandardMaterial({
                color: 0xEAE5DC,
                roughness: 0.75,
                metalness: 0.05
            });

            // Dark architectural concrete / foundation
            this.matDarkConcrete = new THREE.MeshStandardMaterial({
                color: 0x3A3835,
                roughness: 0.85,
                metalness: 0.1
            });

            // Travertine floor tiles
            this.matTravertine = new THREE.MeshStandardMaterial({
                color: 0xE2DDD2,
                roughness: 0.65,
                metalness: 0.03
            });

            // Warm teakwood & cedar slats
            this.matWood = new THREE.MeshStandardMaterial({
                color: 0x9E7348,
                roughness: 0.5,
                metalness: 0.05
            });

            // Smoked dark oak millwork
            this.matDarkWood = new THREE.MeshStandardMaterial({
                color: 0x48392B,
                roughness: 0.6,
                metalness: 0.05
            });

            // Ultra-clear architectural glass
            this.matGlass = new THREE.MeshPhysicalMaterial ? new THREE.MeshPhysicalMaterial({
                color: 0xE6F3F7,
                transparent: true,
                opacity: 0.35,
                roughness: 0.08,
                metalness: 0.1,
                transmission: 0.75,
                ior: 1.5
            }) : new THREE.MeshStandardMaterial({
                color: 0xE6F3F7,
                transparent: true,
                opacity: 0.35,
                roughness: 0.1
            });

            // Dark anodized aluminum mullions / steel beams
            this.matMetal = new THREE.MeshStandardMaterial({
                color: 0x1A1918,
                roughness: 0.35,
                metalness: 0.85
            });

            // Brushed brass & bronze hardware
            this.matBrass = new THREE.MeshStandardMaterial({
                color: 0xC8A86B,
                roughness: 0.3,
                metalness: 0.85
            });

            // Ecru luxury furniture fabric
            this.matFabric = new THREE.MeshStandardMaterial({
                color: 0xEDE9E1,
                roughness: 0.9,
                metalness: 0.0
            });

            // Dark quartz / basalt kitchen counters
            this.matQuartz = new THREE.MeshStandardMaterial({
                color: 0x242322,
                roughness: 0.3,
                metalness: 0.2
            });

            // Car metallic paints
            this.matCarPaintDark = new THREE.MeshStandardMaterial({
                color: 0x1B2129,
                roughness: 0.2,
                metalness: 0.9
            });
            this.matCarPaintSilver = new THREE.MeshStandardMaterial({
                color: 0xB5BAC2,
                roughness: 0.25,
                metalness: 0.85
            });
            this.matCarGlass = new THREE.MeshStandardMaterial({
                color: 0x11161B,
                roughness: 0.1,
                metalness: 0.9
            });
            this.matCarTire = new THREE.MeshStandardMaterial({
                color: 0x181818,
                roughness: 0.95,
                metalness: 0.05
            });
        }

        initLighting() {
            // Ambient warm fill
            const ambient = new THREE.AmbientLight(0xFFF7EC, 0.9);
            this.scene.add(ambient);

            // Sky / Ground subtle hemisphere balance
            const hemiLight = new THREE.HemisphereLight(0xFDF9F3, 0xD4CBBB, 0.45);
            this.scene.add(hemiLight);

            // Key Sunlight (Crisp architectural shadows)
            this.sunLight = new THREE.DirectionalLight(0xFFFAF0, 1.45);
            this.sunLight.position.set(24, 38, 22);
            this.sunLight.castShadow = true;
            this.sunLight.shadow.mapSize.width = 2048;
            this.sunLight.shadow.mapSize.height = 2048;
            this.sunLight.shadow.camera.near = 5;
            this.sunLight.shadow.camera.far = 85;
            const d = 22;
            this.sunLight.shadow.camera.left = -d;
            this.sunLight.shadow.camera.right = d;
            this.sunLight.shadow.camera.top = d;
            this.sunLight.shadow.camera.bottom = -d;
            this.sunLight.shadow.bias = -0.0004;
            this.scene.add(this.sunLight);

            // Secondary cool architectural rim fill
            const rimLight = new THREE.DirectionalLight(0xD6E3ED, 0.4);
            rimLight.position.set(-25, 20, -20);
            this.scene.add(rimLight);

            // Ground shadow catcher plane
            const shadowPlaneGeo = new THREE.PlaneGeometry(120, 120);
            const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.22 });
            const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
            shadowPlane.rotation.x = -Math.PI / 2;
            shadowPlane.position.y = -2.45;
            shadowPlane.receiveShadow = true;
            this.scene.add(shadowPlane);
        }

        buildHouse() {
            // Master root container
            this.houseRoot = new THREE.Group();
            this.scene.add(this.houseRoot);

            // 1. Static Plinth & Landscape Base
            this.buildPlinth();

            // 2. Subterranean Level Group (Lowers on explode)
            this.subterraneanGroup = new THREE.Group();
            this.buildSubterranean();
            this.houseRoot.add(this.subterraneanGroup);

            // 3. Ground Level Group (Living, Dining, Kitchen, Stairs)
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

        // --- SECTION BUILDERS ---

        buildPlinth() {
            const plinthGroup = new THREE.Group();

            // Stone base terrace
            const baseGeo = new THREE.BoxGeometry(22, 0.5, 18);
            const base = new THREE.Mesh(baseGeo, this.matTravertine);
            base.position.set(0, -2.2, 0);
            base.receiveShadow = true;
            plinthGroup.add(base);

            // Entrance stone stepping platforms
            for (let i = 0; i < 3; i++) {
                const step = new THREE.Mesh(
                    new THREE.BoxGeometry(4.5 + i * 0.4, 0.15, 1.2),
                    this.matConcrete
                );
                step.position.set(0, -2.1 + i * 0.15, 9.4 - i * 0.8);
                step.receiveShadow = true;
                step.castShadow = true;
                plinthGroup.add(step);
            }

            // Low-profile gravel border
            const gravel = new THREE.Mesh(
                new THREE.BoxGeometry(24, 0.1, 20),
                new THREE.MeshStandardMaterial({ color: 0xDCD8CF, roughness: 0.95 })
            );
            gravel.position.set(0, -2.4, 0);
            gravel.receiveShadow = true;
            plinthGroup.add(gravel);

            this.houseRoot.add(plinthGroup);
        }

        buildSubterranean() {
            // Basement concrete retaining structure
            const slab = new THREE.Mesh(new THREE.BoxGeometry(16, 0.4, 13), this.matDarkConcrete);
            slab.position.set(0, -2.0, -0.5);
            slab.receiveShadow = true;
            this.subterraneanGroup.add(slab);

            // Rear & side retaining concrete walls
            const rearWall = new THREE.Mesh(new THREE.BoxGeometry(16, 2.2, 0.4), this.matDarkConcrete);
            rearWall.position.set(0, -0.9, -6.8);
            rearWall.castShadow = true;
            this.subterraneanGroup.add(rearWall);

            const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.2, 13), this.matDarkConcrete);
            sideWall.position.set(-7.8, -0.9, -0.5);
            sideWall.castShadow = true;
            this.subterraneanGroup.add(sideWall);

            // Concrete pillars
            for (let x of [-3.5, 3.5]) {
                const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.2, 0.5), this.matConcrete);
                pillar.position.set(x, -0.9, 5.0);
                pillar.castShadow = true;
                this.subterraneanGroup.add(pillar);
            }

            // Subterranean luxury car 1: Dark sports coupe
            const car1 = this.createCar(this.matCarPaintDark, this.matCarGlass);
            car1.position.set(-2.8, -1.75, 1.2);
            car1.rotation.y = -0.05;
            this.subterraneanGroup.add(car1);

            // Subterranean luxury car 2: Silver executive sedan
            const car2 = this.createCar(this.matCarPaintSilver, this.matCarGlass);
            car2.position.set(2.4, -1.75, 1.5);
            car2.rotation.y = 0.08;
            this.subterraneanGroup.add(car2);

            // Built-in illuminated library / wine cellar display
            const bookShelves = this.createBookcase();
            bookShelves.position.set(5.5, -0.9, -5.8);
            this.subterraneanGroup.add(bookShelves);

            // Subterranean warm accent light
            const basementLight = new THREE.PointLight(0xFFCC77, 1.6, 10);
            basementLight.position.set(0, -0.5, 0);
            this.subterraneanGroup.add(basementLight);
        }

        buildGroundLevel() {
            // Ground floor slab
            const floorSlab = new THREE.Mesh(new THREE.BoxGeometry(17, 0.4, 14), this.matTravertine);
            floorSlab.position.set(0, 0.2, 0);
            floorSlab.receiveShadow = true;
            floorSlab.castShadow = true;
            this.groundGroup.add(floorSlab);

            // Rear architectural concrete wall with teakwood panel accents
            const backWall = new THREE.Mesh(new THREE.BoxGeometry(16.5, 2.8, 0.35), this.matConcrete);
            backWall.position.set(0, 1.7, -6.6);
            backWall.castShadow = true;
            this.groundGroup.add(backWall);

            // Teakwood accent panel on back wall
            const woodPanel = new THREE.Mesh(new THREE.BoxGeometry(6.5, 2.6, 0.08), this.matWood);
            woodPanel.position.set(-3.5, 1.7, -6.4);
            this.groundGroup.add(woodPanel);

            // Architectural Living Room: L-shaped luxury sectional sofa
            const sofa = this.createSectionalSofa();
            sofa.position.set(-2.5, 0.4, 1.5);
            this.groundGroup.add(sofa);

            // Designer marble/walnut coffee table
            const table = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.25, 1.4), this.matDarkWood);
            table.position.set(-1.8, 0.52, 1.5);
            table.castShadow = true;
            this.groundGroup.add(table);

            // Living room wool area rug
            const rug = new THREE.Mesh(
                new THREE.BoxGeometry(4.8, 0.02, 3.8),
                new THREE.MeshStandardMaterial({ color: 0xD0C9BD, roughness: 0.95 })
            );
            rug.position.set(-2.2, 0.41, 1.5);
            rug.receiveShadow = true;
            this.groundGroup.add(rug);

            // Monolithic kitchen island with waterfall dark quartz counter
            const island = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.0, 1.5), this.matQuartz);
            island.position.set(4.8, 0.9, -1.8);
            island.castShadow = true;
            this.groundGroup.add(island);

            // Kitchen bar stools
            for (let i = 0; i < 3; i++) {
                const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.75, 16), this.matBrass);
                stool.position.set(3.8 + i * 1.0, 0.77, -0.6);
                stool.castShadow = true;
                this.groundGroup.add(stool);
            }

            // Dining Table & Chairs
            const diningTable = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 1.6), this.matDarkWood);
            diningTable.position.set(4.5, 0.9, 2.6);
            diningTable.castShadow = true;
            this.groundGroup.add(diningTable);

            // Dining table legs
            for (let dx of [-1.4, 1.4]) {
                for (let dz of [-0.6, 0.6]) {
                    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.85, 8), this.matMetal);
                    leg.position.set(4.5 + dx, 0.45, 2.6 + dz);
                    this.groundGroup.add(leg);
                }
            }

            // Signature Architectural Floating Teakwood Staircase
            const stairs = this.createStaircase();
            stairs.position.set(0.6, 0.4, -2.5);
            this.groundGroup.add(stairs);

            // Suspended glass globe pendant chandeliers
            for (let i = 0; i < 3; i++) {
                const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.2, 8), this.matMetal);
                rod.position.set(-2.0 + i * 1.2, 2.4, 1.5);
                this.groundGroup.add(rod);

                const globe = new THREE.Mesh(
                    new THREE.SphereGeometry(0.25, 16, 16),
                    new THREE.MeshStandardMaterial({
                        color: 0xFFF1D0,
                        emissive: 0xFFAA44,
                        emissiveIntensity: 0.8
                    })
                );
                globe.position.set(-2.0 + i * 1.2, 1.7, 1.5);
                this.groundGroup.add(globe);
            }

            // Warm interior point light
            const livingLight = new THREE.PointLight(0xFFAA44, 1.8, 12);
            livingLight.position.set(-1.0, 2.2, 1.0);
            this.groundGroup.add(livingLight);
        }

        buildFrontGlass() {
            // Front double-height glass curtain wall with slim black mullions
            const glassWall = new THREE.Mesh(new THREE.BoxGeometry(11, 5.6, 0.05), this.matGlass);
            glassWall.position.set(0, 3.1, 6.8);
            this.frontGlassGroup.add(glassWall);

            // Black aluminum mullion grid frames
            // Vertical mullions
            for (let i = -5; i <= 5; i += 2.2) {
                const vMullion = new THREE.Mesh(new THREE.BoxGeometry(0.08, 5.6, 0.12), this.matMetal);
                vMullion.position.set(i, 3.1, 6.8);
                this.frontGlassGroup.add(vMullion);
            }
            // Horizontal mullions
            for (let y of [0.4, 2.9, 5.8]) {
                const hMullion = new THREE.Mesh(new THREE.BoxGeometry(11, 0.08, 0.12), this.matMetal);
                hMullion.position.set(0, y, 6.8);
                this.frontGlassGroup.add(hMullion);
            }
        }

        buildLeftWing() {
            // Protruding cantilevered concrete box (upper left study / guest volume)
            const boxFrame = new THREE.Mesh(new THREE.BoxGeometry(5.4, 3.2, 6.2), this.matConcrete);
            boxFrame.position.set(-7.5, 4.4, 2.2);
            boxFrame.castShadow = true;
            this.leftWingGroup.add(boxFrame);

            // Front window cutout with dark frame & glass
            const windowGlass = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.2, 0.04), this.matGlass);
            windowGlass.position.set(-7.5, 4.4, 5.32);
            this.leftWingGroup.add(windowGlass);

            const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.4, 0.1), this.matMetal);
            windowFrame.position.set(-7.5, 4.4, 5.3);
            this.leftWingGroup.add(windowFrame);

            // Cantilevered terrace glass balcony railing
            const railing = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.9, 0.04), this.matGlass);
            railing.position.set(-7.5, 3.2, 5.5);
            this.leftWingGroup.add(railing);
        }

        buildRightWing() {
            // Cantilevered upper right volume with warm vertical wood siding
            const woodBox = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.0, 5.8), this.matWood);
            woodBox.position.set(7.4, 4.3, 1.8);
            woodBox.castShadow = true;
            this.rightWingGroup.add(woodBox);

            // Dark concrete perimeter overhang
            const trim = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.25, 6.0), this.matDarkConcrete);
            trim.position.set(7.4, 5.85, 1.8);
            this.rightWingGroup.add(trim);

            // Upper terrace glass balustrade
            const balconyGlass = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.9, 0.04), this.matGlass);
            balconyGlass.position.set(7.4, 3.2, 4.9);
            this.rightWingGroup.add(balconyGlass);
        }

        buildFloatingPanels() {
            // 6 Vertical architectural panels (as in reference storyboard stages 3 & 5)
            // Left 3 floating panels
            for (let i = 0; i < 3; i++) {
                const panel = new THREE.Mesh(
                    new THREE.BoxGeometry(0.2, 4.5, 1.6),
                    i % 2 === 0 ? this.matConcrete : this.matWood
                );
                panel.position.set(-11.5 - i * 0.9, 3.2 + (i % 2) * 0.5, 4.0 - i * 3.2);
                panel.castShadow = true;
                this.floatingPanelsGroup.add(panel);
            }

            // Right 3 floating panels
            for (let i = 0; i < 3; i++) {
                const panel = new THREE.Mesh(
                    new THREE.BoxGeometry(0.2, 4.5, 1.6),
                    i % 2 === 0 ? this.matConcrete : this.matWood
                );
                panel.position.set(11.5 + i * 0.9, 3.2 + (i % 2) * 0.5, 4.0 - i * 3.2);
                panel.castShadow = true;
                this.floatingPanelsGroup.add(panel);
            }
        }

        buildUpperLevel() {
            // Upper floor slab
            const floorSlab = new THREE.Mesh(new THREE.BoxGeometry(16.5, 0.35, 13.8), this.matConcrete);
            floorSlab.position.set(0, 3.0, 0);
            floorSlab.receiveShadow = true;
            floorSlab.castShadow = true;
            this.upperGroup.add(floorSlab);

            // Master Bedroom: King-size luxury platform bed
            const bed = this.createMasterBed();
            bed.position.set(3.8, 3.2, -1.8);
            this.upperGroup.add(bed);

            // Master suite warm teakwood headboard slat wall
            const headboardWall = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.4, 0.1), this.matWood);
            headboardWall.position.set(3.8, 4.4, -4.2);
            this.upperGroup.add(headboardWall);

            // Upper mezzanine walkway glass balustrade looking down to living room
            const walkwayRail = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.9, 0.04), this.matGlass);
            walkwayRail.position.set(0, 3.65, 0.5);
            this.upperGroup.add(walkwayRail);

            // Upper warm interior point lights
            const suiteLight = new THREE.PointLight(0xFFAA44, 1.5, 10);
            suiteLight.position.set(3.5, 4.8, -1.5);
            this.upperGroup.add(suiteLight);
        }

        buildRoofLevel() {
            // Main flat cantilevered concrete roof slab with dark fascia edge
            const mainRoof = new THREE.Mesh(new THREE.BoxGeometry(18.2, 0.4, 15.2), this.matConcrete);
            mainRoof.position.set(0, 6.0, 0.2);
            mainRoof.castShadow = true;
            this.roofGroup.add(mainRoof);

            // Dark perimeter fascia trim
            const fascia = new THREE.Mesh(new THREE.BoxGeometry(18.3, 0.1, 15.3), this.matMetal);
            fascia.position.set(0, 6.2, 0.2);
            this.roofGroup.add(fascia);

            // Rooftop Pavilion / Skylight Enclosure
            const pavilion = new THREE.Mesh(new THREE.BoxGeometry(8.5, 1.8, 6.5), this.matGlass);
            pavilion.position.set(1.5, 7.0, -0.5);
            this.roofGroup.add(pavilion);

            // Overlapping elevated thin roof canopy
            this.canopyRoof = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.25, 7.6), this.matDarkConcrete);
            this.canopyRoof.position.set(1.5, 8.0, -0.5);
            this.canopyRoof.castShadow = true;
            this.roofGroup.add(this.canopyRoof);

            // Slender steel canopy support posts
            for (let dx of [-4.0, 4.0]) {
                for (let dz of [-3.0, 3.0]) {
                    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.0, 8), this.matMetal);
                    post.position.set(1.5 + dx, 7.0, -0.5 + dz);
                    this.roofGroup.add(post);
                }
            }

            // Modern rooftop sun loungers
            for (let i = 0; i < 2; i++) {
                const lounger = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 2.0), this.matFabric);
                lounger.position.set(-4.5 + i * 1.3, 6.3, 2.5);
                lounger.rotation.y = 0.2;
                this.roofGroup.add(lounger);
            }
        }

        // --- DETAILED OBJECT BUILDERS ---

        createCar(paintMat, glassMat) {
            const car = new THREE.Group();

            // Lower body chassis
            const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.55, 4.4), paintMat);
            lowerBody.position.y = 0.45;
            lowerBody.castShadow = true;
            car.add(lowerBody);

            // Cabin / greenhouse (sleek tapered roof)
            const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.45, 2.4), glassMat);
            cabin.position.set(0, 0.9, -0.2);
            cabin.castShadow = true;
            car.add(cabin);

            // Roof cap
            const roofCap = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.05, 1.8), paintMat);
            roofCap.position.set(0, 1.15, -0.2);
            car.add(roofCap);

            // Headlight light bars (LED glow)
            const headlight = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 0.08, 0.05),
                new THREE.MeshStandardMaterial({
                    color: 0xE6F5FF,
                    emissive: 0x88CCFF,
                    emissiveIntensity: 0.9
                })
            );
            headlight.position.set(0, 0.5, 2.22);
            car.add(headlight);

            // Wheels & dark alloy rims
            const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.25, 16);
            wheelGeo.rotateZ(Math.PI / 2);
            const positions = [
                [-1.0, 0.32, 1.3],
                [1.0, 0.32, 1.3],
                [-1.0, 0.32, -1.3],
                [1.0, 0.32, -1.3]
            ];
            for (let pos of positions) {
                const wheel = new THREE.Mesh(wheelGeo, this.matCarTire);
                wheel.position.set(pos[0], pos[1], pos[2]);
                wheel.castShadow = true;
                car.add(wheel);

                const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.27, 8), this.matBrass);
                rim.rotateZ(Math.PI / 2);
                rim.position.set(pos[0], pos[1], pos[2]);
                car.add(rim);
            }

            return car;
        }

        createBookcase() {
            const bookcase = new THREE.Group();
            const frame = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.0, 0.5), this.matDarkWood);
            frame.castShadow = true;
            bookcase.add(frame);

            // Shelves & colorful books
            const bookColors = [0x9E7348, 0xC8A86B, 0x8C857B, 0xEAE5DC, 0x2A2928];
            for (let row = 0; row < 4; row++) {
                const y = -0.7 + row * 0.45;
                const shelf = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.04, 0.48), this.matBrass);
                shelf.position.set(0, y, 0);
                bookcase.add(shelf);

                // Book clumps
                for (let b = 0; b < 6; b++) {
                    const c = bookColors[(row + b) % bookColors.length];
                    const book = new THREE.Mesh(
                        new THREE.BoxGeometry(0.12 + Math.random() * 0.1, 0.32 + Math.random() * 0.08, 0.35),
                        new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 })
                    );
                    book.position.set(-1.2 + b * 0.45, y + 0.18, 0.02);
                    bookcase.add(book);
                }
            }
            return bookcase;
        }

        createSectionalSofa() {
            const sofa = new THREE.Group();
            // Main seating cushion
            const mainBase = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.38, 1.4), this.matFabric);
            mainBase.position.set(0, 0.2, 0);
            mainBase.castShadow = true;
            sofa.add(mainBase);

            // Chaise lounge section
            const chaise = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.38, 1.8), this.matFabric);
            chaise.position.set(-1.1, 0.2, 1.6);
            chaise.castShadow = true;
            sofa.add(chaise);

            // Backrest
            const backrest = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.55, 0.35), this.matFabric);
            backrest.position.set(0, 0.55, -0.55);
            backrest.castShadow = true;
            sofa.add(backrest);

            // Throw pillows
            for (let i = 0; i < 3; i++) {
                const pillow = new THREE.Mesh(
                    new THREE.BoxGeometry(0.45, 0.45, 0.15),
                    this.matWood
                );
                pillow.position.set(-0.8 + i * 0.8, 0.55, -0.3);
                pillow.rotation.y = 0.1 * i;
                sofa.add(pillow);
            }
            return sofa;
        }

        createMasterBed() {
            const bed = new THREE.Group();
            // Platform frame
            const frame = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.28, 3.2), this.matDarkWood);
            frame.position.y = 0.14;
            frame.castShadow = true;
            bed.add(frame);

            // Mattress & crisp white bedding
            const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.35, 2.9), this.matFabric);
            mattress.position.set(0, 0.45, 0.1);
            mattress.castShadow = true;
            bed.add(mattress);

            // Dark duvet folded throw
            const duvet = new THREE.Mesh(
                new THREE.BoxGeometry(2.52, 0.12, 1.5),
                new THREE.MeshStandardMaterial({ color: 0x3E3A35, roughness: 0.8 })
            );
            duvet.position.set(0, 0.65, 0.7);
            bed.add(duvet);

            // Dual pillows
            for (let x of [-0.65, 0.65]) {
                const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.18, 0.55), this.matFabric);
                pillow.position.set(x, 0.7, -0.9);
                bed.add(pillow);
            }

            // Dual bedside pedestals & glowing cube lamps
            for (let x of [-1.8, 1.8]) {
                const pedestal = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.65), this.matDarkWood);
                pedestal.position.set(x, 0.23, -0.8);
                bed.add(pedestal);

                const lamp = new THREE.Mesh(
                    new THREE.BoxGeometry(0.25, 0.35, 0.25),
                    new THREE.MeshStandardMaterial({
                        color: 0xFFF1D5,
                        emissive: 0xFFAA44,
                        emissiveIntensity: 0.7
                    })
                );
                lamp.position.set(x, 0.63, -0.8);
                bed.add(lamp);
            }

            return bed;
        }

        createStaircase() {
            const stairs = new THREE.Group();
            const stepCount = 14;
            const stepHeight = 0.18;
            const stepDepth = 0.32;
            const stepWidth = 1.6;

            for (let i = 0; i < stepCount; i++) {
                const step = new THREE.Mesh(
                    new THREE.BoxGeometry(stepWidth, 0.08, stepDepth),
                    this.matWood
                );
                step.position.set(0, i * stepHeight, i * stepDepth);
                step.castShadow = true;
                stairs.add(step);
            }

            // Ultra-clear glass balustrade with black top handrail
            const balustrade = new THREE.Mesh(
                new THREE.BoxGeometry(0.04, 2.8, stepCount * stepDepth),
                this.matGlass
            );
            balustrade.position.set(stepWidth / 2, 1.5, (stepCount * stepDepth) / 2);
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
            this.roofGroup.position.y = this.initialPositions.roofY + easedRoof * 8.2;

            // Extra canopy elevation within roof group
            if (this.canopyRoof) {
                this.canopyRoof.position.y = 8.0 + easedRoof * 2.4;
            }

            // 2. Upper Level Group Lift (Vertical separation between floors)
            const floorSplit = Math.min(1, Math.max(0, (progress - 0.25) / 0.7));
            const easedFloor = this.easeOutCubic(floorSplit);
            this.upperGroup.position.y = this.initialPositions.upperY + easedFloor * 4.4;

            // 3. Left & Right Cantilevered Wings (Slide horizontally outward)
            const wingSlide = Math.min(1, Math.max(0, (progress - 0.2) / 0.75));
            const easedWing = this.easeInOutQuad(wingSlide);
            this.leftWingGroup.position.x = this.initialPositions.leftWingX - easedWing * 5.2;
            this.rightWingGroup.position.x = this.initialPositions.rightWingX + easedWing * 5.2;

            // 4. Floating Exterior Wall Panels (Move further out left/right)
            const panelSlide = Math.min(1, Math.max(0, (progress - 0.18) / 0.78));
            const easedPanels = this.easeOutCubic(panelSlide);
            this.floatingPanelsGroup.position.x = this.initialPositions.floatingPanelsX + (easedPanels * 1.5);
            // Apply scale/spread to individual children
            this.floatingPanelsGroup.children.forEach((child, idx) => {
                const dir = idx < 3 ? -1 : 1;
                child.position.x = (dir * (11.5 + (idx % 3) * 0.9)) + (dir * easedPanels * 4.8);
            });

            // 5. Front Curtain Glass Façade (Moves forward)
            const glassSlide = Math.min(1, Math.max(0, (progress - 0.15) / 0.8));
            const easedGlass = this.easeOutCubic(glassSlide);
            this.frontGlassGroup.position.z = this.initialPositions.frontGlassZ + easedGlass * 4.2;

            // 6. Subterranean Group (Lowers slightly downward for maximum separation)
            const subDrop = Math.min(1, Math.max(0, (progress - 0.28) / 0.7));
            const easedSub = this.easeOutCubic(subDrop);
            this.subterraneanGroup.position.y = this.initialPositions.subterraneanY - easedSub * 2.8;

            // 7. Dynamic Camera Elevation & Framing during explosion
            const camProgress = this.easeOutCubic(progress);
            this.camera.position.x = this.initialCameraPos.x + camProgress * 4.5;
            this.camera.position.y = this.initialCameraPos.y + camProgress * 4.0;
            this.camera.position.z = this.initialCameraPos.z + camProgress * 3.5;
            this.cameraTarget.y = 3.2 + camProgress * 2.2;
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
