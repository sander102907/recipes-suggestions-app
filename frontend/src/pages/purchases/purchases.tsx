import { GraphModel } from "@tensorflow/tfjs";
import { useState, useEffect, useRef } from "react";
import {
  extractBoundingBoxesFromHeatmap,
  extractLinesFromCrops,
  getCrops,
  getHeatMapFromImage,
  loadDetectionModel,
  loadRecognitionModel,
  processLines,
  transformTopDownView
} from "../../helpers/modelHelper";
import "./purchases.css";
import { Button, Card } from "react-bootstrap";
import { Plus } from "react-bootstrap-icons";
import axios from "axios";
import { Ingredient } from "../../interfaces/Ingredient";
import { default as IngredientComponent } from "../../components/ingredient/ingredient";
import { WithAmount } from "../../types/withAmount";

const Purchases = () => {
  const recognitionModel = useRef<GraphModel | null>(null);
  const detectionModel = useRef<GraphModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [products, setProducts] = useState<WithAmount<Ingredient>[]>([]);
  const [totalPrice, setTotalPrice] = useState<number | undefined>(undefined);
  const [subtotalPrice, setSubTotalPrice] = useState<number | undefined>(undefined);
  const [discount, setDiscount] = useState<number | undefined>(undefined);

  useEffect(() => {
    loadRecognitionModel({ recognitionModel });
    loadDetectionModel({ detectionModel });
  }, []);

  const onUpload = (image: HTMLImageElement) => {
    setImage(image);
    setLoading(true);
  };

  useEffect(() => {
    if (image && loading) {
      loadImage(image)
    }
  }, [loading]);

  const loadImage = async (image: HTMLImageElement) => {
    const topdownImage = transformTopDownView(image);
    const heatmap = await getHeatMapFromImage({ detectionModel: detectionModel.current!, image: topdownImage });

    const boundingBoxes = extractBoundingBoxesFromHeatmap(heatmap, topdownImage.cols, topdownImage.rows);
    const crops = await getCrops(topdownImage, boundingBoxes);

    // @ts-ignore
    const lines = await extractLinesFromCrops({ recognitionModel: recognitionModel.current, crops: crops });

    console.log(lines);

    const products = processLines(lines);

    setTotalPrice(products.find(x => x.name.toUpperCase().includes("TOTAAL") && !x.name.toUpperCase().includes("SUB"))?.totalPrice)
    setDiscount(products.find(x => x.name.toUpperCase().includes("VOORDEEL"))?.totalPrice)
    setSubTotalPrice(products.find(x => x.name.toUpperCase().includes("SUBTOTAAL"))?.totalPrice)

    setLoading(false);

    axios
      .post<WithAmount<Ingredient>[]>("/api/receipt/", products)
      .then(async (response) => {
        setProducts(response.data);
      });
  };

  return (
    <>
      {loading ?
        <div className="scan-container">
          <div className="scan">
            <svg fill="#000" shape-rendering="crispEdges">
              <path transform="matrix(1.5730,0,0,48.0000,20,16)" d="M176,1h2V0h-2v1zM174,1h1V0h-1v1zM170,1h3V0h-3v1zM165,1h2V0h-2v1zM162,1h1V0h-1v1zM158,1h3V0h-3v1zM154,1h2V0h-2v1zM150,1h1V0h-1v1zM146,1h3V0h-3v1zM143,1h2V0h-2v1zM139,1h3V0h-3v1zM135,1h3V0h-3v1zM132,1h2V0h-2v1zM128,1h2V0h-2v1zM126,1h1V0h-1v1zM121,1h3V0h-3v1zM117,1h2V0h-2v1zM114,1h1V0h-1v1zM110,1h3V0h-3v1zM106,1h3V0h-3v1zM103,1h2V0h-2v1zM99,1h3V0h-3v1zM96,1h1V0h-1v1zM92,1h3V0h-3v1zM88,1h2V0h-2v1zM85,1h1V0h-1v1zM80,1h3V0h-3v1zM77,1h2V0h-2v1zM73,1h3V0h-3v1zM70,1h1V0h-1v1zM66,1h2V0h-2v1zM61,1h3V0h-3v1zM59,1h1V0h-1v1zM55,1h2V0h-2v1zM53,1h1V0h-1v1zM48,1h3V0h-3v1zM44,1h2V0h-2v1zM41,1h2V0h-2v1zM36,1h3V0h-3v1zM33,1h1V0h-1v1zM30,1h2V0h-2v1zM26,1h1V0h-1v1zM22,1h1V0h-1v1zM18,1h3V0h-3v1zM16,1h1V0h-1v1zM11,1h2V0h-2v1zM6,1h1V0h-1v1zM3,1h1V0h-1v1zM0,1h2V0h-2v1z" />
            </svg>
          </div>
          <span>Producten aan het scannen...</span>
        </div> :

        <div className="image-button-container upload-receipt-button-container">
          <Button variant="" className="image-button upload-receipt-button">
            <Plus fontSize={28} />
          </Button>

          <input
            name='image'
            accept='image/*'
            id='contained-button-file'
            type='file'
            onChange={(event) => {
              if (event.target.files && event.target.files[0]) {
                var reader = new FileReader();

                const image = new Image();

                reader.readAsDataURL(event.target.files[0]); // read file as data url

                reader.onload = (event) => { // called once readAsDataURL is completed
                  if (event.target) {
                    image.src = event.target.result as string;

                    image.onload = () => {
                      onUpload(image);
                    }
                  }
                }
              }
            }}
          />
        </div>
      }
      {products.length > 0 &&
        <Card className="receipt-container">
          <div className="receipt-totals-container">
            <h6 className="receipt-totals-title">Subtotaal</h6>
            <h6 className="receipt-totals-price">€{subtotalPrice}</h6>
            <br />
            <h6 className="receipt-totals-title discount">Voordeel</h6>
            <h6 className="receipt-totals-price discount">€{discount}</h6>
            <br />
            <h4 className="receipt-totals-title total-price">Totaal</h4>
            <h5 className="receipt-totals-price total-price">€{totalPrice}</h5>
          </div>
          <hr />
          <div className="receipt-items-container">
            {products.map((product, index) =>
              <IngredientComponent ingredientInGroup={{ ingredient: product, amount: product.amount, ingredientId: product.id! }} key={index} />
            )}
          </div>
        </Card>
      }
    </>
  )
};

export default Purchases;
