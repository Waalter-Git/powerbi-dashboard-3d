import powerbi from "powerbi-visuals-api";
import "./../style/visual.less";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
export declare class Visual implements IVisual {
    private container;
    private scene;
    private camera;
    private renderer;
    private grupoBarras;
    private animationFrameId;
    private estaArrastando;
    private mouseAnteriorX;
    private mouseAnteriorY;
    constructor(options: VisualConstructorOptions);
    update(options: VisualUpdateOptions): void;
    private criarIluminacao;
    private criarPiso;
    private obterCor;
    private criarBarras;
    private configurarControles;
    private iniciarAnimacao;
    destroy(): void;
}
