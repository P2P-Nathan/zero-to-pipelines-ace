import React, { useState, useEffect } from 'react';
import ForgeReconciler, {
  Form,
  Label,
  Textfield,
  useForm,
  FormSection,
  FormFooter,
  ButtonGroup,
  LoadingButton,
  Button,
  Select,
  HelperMessage,
} from "@forge/react";
import { view } from '@forge/bridge';
import { fetch } from "@forge/api";

const Edit = () => {
  const [renderContext, setRenderContext] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { handleSubmit, register, getFieldId, getValues } = useForm();

  // State for holding the fetched planets
  const [isLoadingPlanets, setIsLoadingPlanets] = useState(false);
  const [planets, setPlanets] = useState([]);
    
// Fetch the context and planets
  useEffect(() => {
    view
      .getContext()
      .then((context) => setRenderContext(context.extension.renderContext));

    setIsLoadingPlanets(false); // Start the loading spinner
    // Fetch planets from the Star Wars API
    fetch("https://swapi.dev/api/planets/")
      .then((response) => response.json())
      .then((data) => {
        // Transform planets data into the format expected by the Select component
        const planetOptions = data.results.map((planet) => ({
          label: planet.name,
          value: planet.name,
        }));
        setPlanets(planetOptions); // Set the planets as options
        setIsLoadingPlanets(false); // Stop the loading spinner
      })
      .catch((error) => console.error("Error fetching planets:", error));
  }, []);

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      const { fieldName } = getValues();
      await view.submit(fieldName?.value || null);
    } catch (e) {
      setIsLoading(false);
      console.error(e);
    }
  };

  return renderContext === 'issue-view' ? (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormSection>
        <Label labelFor={getFieldId("fieldName")}>
          Which planet did this happen on?
        </Label>
        <Select
          placeholder="Select a planet"
          options={planets}
          isLoading={isLoadingPlanets}
          {...register("fieldName")}
        />
        {/* These are only needed for the issue-view */}
        <HelperMessage>{"\u00a0"}</HelperMessage>
        <HelperMessage>{"\u00a0"}</HelperMessage>
        <HelperMessage>{"\u00a0"}</HelperMessage>
        <HelperMessage>{"\u00a0"}</HelperMessage>
        <HelperMessage>{"\u00a0"}</HelperMessage>
        <HelperMessage>{"\u00a0"}</HelperMessage>
        <HelperMessage>{"\u00a0"}</HelperMessage>
        <HelperMessage>{"\u00a0"}</HelperMessage>
        <HelperMessage>{"\u00a0"}</HelperMessage>
        <HelperMessage>{"\u00a0"}</HelperMessage>
      </FormSection>
      <FormFooter>
        <ButtonGroup>
          <Button appearance="subtle" onClick={view.close}>Close</Button>
          <LoadingButton appearance="primary" type="submit" isLoading={isLoading}>
            Submit
          </LoadingButton>
        </ButtonGroup>
      </FormFooter>
    </Form>
  ) : (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Label labelFor={getFieldId("fieldName")}>
        Which planet did this happen on?
      </Label>
      <Select
        options={planets}
        isLoading={isLoadingPlanets}
        {...register("fieldName")}
      />
    </Form>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <Edit />
  </React.StrictMode>
);
