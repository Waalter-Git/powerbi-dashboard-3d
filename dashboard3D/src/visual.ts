"use strict";

import powerbi from "powerbi-visuals-api";
import * as THREE from "three";

import "./../style/visual.less";

import IVisual =
    powerbi.extensibility.visual.IVisual;

import VisualConstructorOptions =
    powerbi.extensibility.visual.VisualConstructorOptions;

import VisualUpdateOptions =
    powerbi.extensibility.visual.VisualUpdateOptions;

/*
 * DADOS TEMPORÁRIOS
 *
 * Depois eles serão substituídos pelos
 * campos e medidas do Power BI.
 */

interface DadoDashboard {
    categoria: string;
    valor: number;
    meta: number;
}

const dadosTeste: DadoDashboard[] = [
    {
        categoria: "Área 1",
        valor: 85,
        meta: 100
    },
    {
        categoria: "Área 2",
        valor: 120,
        meta: 100
    },
    {
        categoria: "Área 3",
        valor: 72,
        meta: 100
    },
    {
        categoria: "Área 4",
        valor: 98,
        meta: 100
    },
    {
        categoria: "Área 5",
        valor: 135,
        meta: 120
    }
];

export class Visual implements IVisual {

    private container: HTMLElement;

    private scene: THREE.Scene;

    private camera: THREE.PerspectiveCamera;

    private renderer: THREE.WebGLRenderer;

    private grupoBarras: THREE.Group;

    private animationFrameId:
        number | null = null;

    private estaArrastando: boolean = false;

    private mouseAnteriorX: number = 0;

    private mouseAnteriorY: number = 0;

    constructor(
        options: VisualConstructorOptions
    ) {

        /*
         * Contêiner fornecido pelo Power BI.
         */

        this.container = options.element;

        this.container.classList.add(
        "dashboard-3d"
        );

        this.container.style.position =
            "relative";

        this.container.style.overflow =
            "hidden";


        /*
         * CENA
         */

        this.scene = new THREE.Scene();

        this.scene.background =
            new THREE.Color("#1b1b1b");


        /*
         * CÂMERA
         */

        this.camera =
            new THREE.PerspectiveCamera(
                55,
                1,
                0.1,
                1000
            );

        this.camera.position.set(
            8,
            7,
            12
        );

        this.camera.lookAt(
            0,
            3,
            0
        );


        /*
         * RENDERIZADOR
         */

        this.renderer =
            new THREE.WebGLRenderer({
                antialias: true
            });

        this.renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                2
            )
        );

        this.renderer.shadowMap.enabled =
            true;

        this.renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;

        this.renderer.domElement.style.width =
            "100%";

        this.renderer.domElement.style.height =
            "100%";

        this.renderer.domElement.style.display =
            "block";

        this.renderer.domElement.style.cursor =
            "grab";

        this.container.appendChild(
            this.renderer.domElement
        );


        /*
         * GRUPO DAS BARRAS
         */

        this.grupoBarras =
            new THREE.Group();

        this.scene.add(
            this.grupoBarras
        );


        /*
         * MONTA A CENA
         */

        this.criarIluminacao();

        this.criarPiso();

        this.criarBarras(
            dadosTeste
        );

        this.configurarControles();

        this.iniciarAnimacao();
    }


    /*
     * CHAMADO PELO POWER BI QUANDO O
     * VISUAL MUDA DE TAMANHO OU DADOS.
     */

    public update(
        options: VisualUpdateOptions
    ): void {

        const largura =
            Math.max(
                options.viewport.width,
                1
            );

        const altura =
            Math.max(
                options.viewport.height,
                1
            );

        this.renderer.setSize(
            largura,
            altura,
            false
        );

        this.camera.aspect =
            largura / altura;

        this.camera.updateProjectionMatrix();

        this.renderer.render(
            this.scene,
            this.camera
        );
    }


    /*
     * ILUMINAÇÃO
     */

    private criarIluminacao(): void {

        const luzAmbiente =
            new THREE.AmbientLight(
                0xffffff,
                1.7
            );

        this.scene.add(
            luzAmbiente
        );


        const luzDirecional =
            new THREE.DirectionalLight(
                0xffffff,
                3
            );

        luzDirecional.position.set(
            8,
            12,
            10
        );

        luzDirecional.castShadow =
            true;

        this.scene.add(
            luzDirecional
        );
    }


    /*
     * PISO E GRADE
     */

    private criarPiso(): void {

        const geometriaPiso =
            new THREE.PlaneGeometry(
                30,
                30
            );

        const materialPiso =
            new THREE.MeshStandardMaterial({
                color: "#333333",
                roughness: 0.9,
                metalness: 0
            });

        const piso =
            new THREE.Mesh(
                geometriaPiso,
                materialPiso
            );

        piso.rotation.x =
            -Math.PI / 2;

        piso.receiveShadow =
            true;

        this.scene.add(
            piso
        );


        const grade =
            new THREE.GridHelper(
                30,
                30,
                "#777777",
                "#444444"
            );

        grade.position.y =
            0.01;

        this.scene.add(
            grade
        );
    }


    /*
     * COR POR PERCENTUAL
     */

    private obterCor(
        percentual: number
    ): string {

        if (percentual < 80) {

            return "#B33D26";
        }

        if (percentual < 100) {

            return "#F2C94C";
        }

        return "#44A85C";
    }


    /*
     * CRIA AS BARRAS
     */

    private criarBarras(
        dados: DadoDashboard[]
    ): void {

        const maiorValor =
            Math.max(
                ...dados.map(
                    item =>
                        Math.abs(
                            item.valor
                        )
                ),
                1
            );

        const espacamento =
            3;

        const larguraTotal =
            (
                dados.length - 1
            ) * espacamento;

        dados.forEach(
            (
                item:
                    DadoDashboard,
                indice:
                    number
            ) => {

                const percentual =
                    item.meta > 0
                        ? (
                            item.valor /
                            item.meta
                        ) * 100
                        : 0;

                const altura =
                    Math.max(
                        (
                            Math.abs(
                                item.valor
                            ) /
                            maiorValor
                        ) * 7,
                        0.2
                    );

                const geometria =
                    new THREE.BoxGeometry(
                        1.7,
                        altura,
                        1.7
                    );

                const material =
                    new THREE
                        .MeshStandardMaterial({
                            color:
                                this.obterCor(
                                    percentual
                                ),

                            roughness:
                                0.35,

                            metalness:
                                0.15
                        });

                const barra =
                    new THREE.Mesh(
                        geometria,
                        material
                    );

                barra.position.x =
                    indice *
                    espacamento -
                    larguraTotal / 2;

                barra.position.y =
                    altura / 2;

                barra.position.z =
                    0;

                barra.castShadow =
                    true;

                barra.receiveShadow =
                    true;

                barra.userData = {
                    categoria:
                        item.categoria,

                    valor:
                        item.valor,

                    meta:
                        item.meta,

                    percentual:
                        percentual
                };

                this.grupoBarras.add(
                    barra
                );
            }
        );
    }


    /*
     * ROTAÇÃO MANUAL E ZOOM
     */

    private configurarControles(): void {

        const canvas =
            this.renderer.domElement;

        canvas.addEventListener(
            "pointerdown",
            (
                evento:
                    PointerEvent
            ) => {

                if (
                    evento.button !== 0
                ) {

                    return;
                }

                this.estaArrastando =
                    true;

                this.mouseAnteriorX =
                    evento.clientX;

                this.mouseAnteriorY =
                    evento.clientY;

                canvas.setPointerCapture(
                    evento.pointerId
                );

                canvas.style.cursor =
                    "grabbing";
            }
        );


        canvas.addEventListener(
            "pointermove",
            (
                evento:
                    PointerEvent
            ) => {

                if (
                    !this.estaArrastando
                ) {

                    return;
                }

                const movimentoX =
                    evento.clientX -
                    this.mouseAnteriorX;

                const movimentoY =
                    evento.clientY -
                    this.mouseAnteriorY;

                this.grupoBarras
                    .rotation
                    .y +=
                    movimentoX *
                    0.01;

                this.grupoBarras
                    .rotation
                    .x +=
                    movimentoY *
                    0.005;

                this.grupoBarras
                    .rotation
                    .x =
                    Math.max(
                        -0.35,
                        Math.min(
                            0.35,
                            this
                                .grupoBarras
                                .rotation
                                .x
                        )
                    );

                this.mouseAnteriorX =
                    evento.clientX;

                this.mouseAnteriorY =
                    evento.clientY;
            }
        );


        canvas.addEventListener(
            "pointerup",
            (
                evento:
                    PointerEvent
            ) => {

                this.estaArrastando =
                    false;

                if (
                    canvas
                        .hasPointerCapture(
                            evento.pointerId
                        )
                ) {

                    canvas
                        .releasePointerCapture(
                            evento.pointerId
                        );
                }

                canvas.style.cursor =
                    "grab";
            }
        );


        canvas.addEventListener(
            "pointercancel",
            () => {

                this.estaArrastando =
                    false;

                canvas.style.cursor =
                    "grab";
            }
        );


        canvas.addEventListener(
            "wheel",
            (
                evento:
                    WheelEvent
            ) => {

                evento.preventDefault();

                if (
                    evento.deltaY > 0
                ) {

                    this.camera
                        .position
                        .multiplyScalar(
                            1.08
                        );

                } else {

                    this.camera
                        .position
                        .multiplyScalar(
                            0.92
                        );
                }

                const distancia =
                    this.camera
                        .position
                        .length();

                if (
                    distancia < 7
                ) {

                    this.camera
                        .position
                        .normalize()
                        .multiplyScalar(
                            7
                        );
                }

                if (
                    distancia > 30
                ) {

                    this.camera
                        .position
                        .normalize()
                        .multiplyScalar(
                            30
                        );
                }

                this.camera.lookAt(
                    0,
                    3,
                    0
                );
            },
            {
                passive: false
            }
        );
    }


    /*
     * ANIMAÇÃO
     */

    private iniciarAnimacao(): void {

        const animar =
            (): void => {

                this.animationFrameId =
                    window
                        .requestAnimationFrame(
                            animar
                        );

                if (
                    !this.estaArrastando
                ) {

                    this.grupoBarras
                        .rotation
                        .y +=
                        0.003;
                }

                this.renderer.render(
                    this.scene,
                    this.camera
                );
            };

        animar();
    }


    /*
     * LIMPEZA QUANDO O VISUAL
     * FOR REMOVIDO.
     */

    public destroy(): void {

        if (
            this.animationFrameId !==
            null
        ) {

            window
                .cancelAnimationFrame(
                    this.animationFrameId
                );
        }

        this.grupoBarras.traverse(
            objeto => {

                if (
                    objeto instanceof
                    THREE.Mesh
                ) {

                    objeto.geometry
                        .dispose();

                    if (
                        Array.isArray(
                            objeto.material
                        )
                    ) {

                        objeto.material
                            .forEach(
                                material =>
                                    material
                                        .dispose()
                            );

                    } else {

                        objeto.material
                            .dispose();
                    }
                }
            }
        );

        this.renderer.dispose();

        if (
            this.renderer
                .domElement
                .parentElement ===
            this.container
        ) {

            this.container.removeChild(
                this.renderer
                    .domElement
            );
        }
    }
}