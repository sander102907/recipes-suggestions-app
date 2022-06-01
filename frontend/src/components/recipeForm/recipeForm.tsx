import { Formik } from "formik";
import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { ArrowRight, CloudArrowUp } from "react-bootstrap-icons";
import { Rating } from "react-simple-star-rating";
import * as yup from 'yup';
import ReactQuill from "react-quill";
import { Recipe } from "../../interfaces/Recipe";
import { Image } from "../../interfaces/Image";
import "./recipeForm.css";
import axios from "axios";


const schema = yup.object().shape({
    name: yup.string().required().min(2),
    description: yup.string(),
    rating: yup.number().positive().integer(),
});

type Props = {
    recipe?: Recipe,
    setRecipe: (recipe: Recipe) => void,
    onNextPage: () => void
}

interface RecipeData {
    name: string;
    description: string | undefined;
    rating: number;
    imageId?: number | undefined;
    imageData?: string;
}

const RecipeForm = ({ recipe, setRecipe, onNextPage }: Props) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const onSubmit = async (data: RecipeData) => {
        if (data.imageData) {
            const formData = new FormData();
            formData.set('file', data.imageData);

            const imgResponse = await axios.post<Image>('/api/files/image', formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    }
                }
            );
            data.imageId = imgResponse.data.id;
        }

        delete data.imageData;

        data.rating /= 20;

        if (!data.imageId) {
            delete data.imageId;
        }

        recipe ? updateRecipe(recipe.id, data) : createRecipe(data);

        onNextPage();
    };

    const createRecipe = async (data: RecipeData) => {
        const response = await axios.post('/api/recipes', data);
        setRecipe(response.data);
    }

    const updateRecipe = async (id: number, data: RecipeData) => {
        await axios.patch(`/api/recipes/${id}`, data);
    }

    return (
        <Formik
            validationSchema={schema}
            onSubmit={onSubmit}
            initialValues={{
                name: recipe ? recipe.name : '',
                description: recipe ? recipe.description : '',
                rating: recipe && recipe.rating ? recipe.rating * 20 : 0,
                imageId: recipe ? recipe.imageId : undefined,
                imageData: undefined
            }}
        >
            {({
                handleSubmit,
                handleChange,
                setFieldValue,
                isSubmitting,
                values,
                errors,
            }) => (
                <Form noValidate onSubmit={handleSubmit} className="recipe-form">
                    <Form.Label>Beoordeling</Form.Label>
                    <div>
                        <Rating
                            onClick={rating => {
                                setFieldValue('rating', rating);
                            }}
                            ratingValue={values.rating}
                            transition={true}
                        />
                    </div>
                    <Form.Label>Naam</Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        isInvalid={!!errors.name}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.name}
                    </Form.Control.Feedback>

                    <Form.Label>Beschrijving</Form.Label>
                    <ReactQuill
                        className="description mb-3"
                        theme="snow"
                        value={values.description}
                        onChange={description => setFieldValue('description', description)}
                        placeholder={"Beschrijving"}
                    />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>

                    {(values.imageId || imagePreview) &&
                        <img className="image-preview" src={imagePreview || `/api/files/${values.imageId}`} />}

                    <div className="image-button-container">
                        <Button variant="" className="image-button">
                            <CloudArrowUp /> {(values.imageId || imagePreview) ? 'Wijzig foto' : 'Kies foto'}
                        </Button>

                        <input
                            name='image'
                            accept='image/*'
                            id='contained-button-file'
                            type='file'
                            onChange={(event) => {
                                if (event.target.files && event.target.files[0]) {
                                    var reader = new FileReader();

                                    setFieldValue('imageData', event.target.files[0]);

                                    reader.readAsDataURL(event.target.files[0]); // read file as data url

                                    reader.onload = (event) => { // called once readAsDataURL is completed
                                        if (event.target) {
                                            setImagePreview(event.target.result as string | null);
                                        }
                                    }
                                }
                            }}
                        />
                    </div>

                    <Button variant="" type="submit" className="next-button" disabled={isSubmitting}><ArrowRight size={32} /></Button>
                </Form>
            )
            }
        </Formik >
    );
}

export default RecipeForm;