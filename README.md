# zero-to-pipelines-ace
 Demos from the Zero to Pipelines Atlassian Community Event

 The below steps walk you through creating the ***issue-on-planet-field*** app which connects to the Star Wars API and gives your users a list of planets to pick from on their Jira issues.  This could easily be used to pull a list of company specific items to add to your issues.

## Prerequisites
1. Latest version of the [Forge CLI](https://developer.atlassian.com/platform/forge/cli-reference/) 
2. A valid [API Token](https://id.atlassian.com/manage-profile/security/api-tokens) from Atlassian
3. Logged in terminal session with `forge login`

## Step One: **Create**
Run `forge create` to create a new **UI Kit** app for **Jira** with the `jira-custom-field` type.

This will get us our base scaffolding for the application as well as get things configured for a **UI Kit** or **Custom UI** setup.  You can extend on with any of the other components from this baseline.

![Creation UI Choices](creation_cli_image.png)

## Step Two: **Permissions**
Update the contents of `manifest.yml` to give your app the permission to reach to the external API.  This is also the time to add an improved name and description.

*These permissions are added to the end of the file and tell Forge to allow the outbound calls to this domain.  Wild cards can be used if needed.*
```yaml
permissions:
  scopes: []
  external:
    fetch:
      client:
        - swapi.dev
      backend:
        - swapi.dev
```

*Optionally, take a moment to put something a little more helpful in the `name` and `description` fields.*
```yaml
modules:
  jira:customField:
    - key: issue-on-planet-field-custom-field-ui-kit-2-hello-world
      name: issue-on-planet-field
      description: A hello world custom field.
```

## Step Three: **Add HTTP Fetch**
We'll be using the [basic fetch client](https://developer.atlassian.com/platform/forge/runtime-reference/fetch-api.basic/) which is included in the `@forge/api` package.  We need to add the package, and then a block of code to make our HTTP Get and populate our drop-down list.

Run `npm i @forge/api` from the root folder of your new application to add the package.

Next, import it into the `src/frontend/edit.jsx` file and add a `fetch("https://swapi.dev/api/planets/")` to get our planets from the Start Wars API.

*The import statement can be added at the end of the list of the existing imports*
```js
import { fetch } from "@forge/api";
```

*We've added a couple new constants to hold state for our `<Select>` and planet loading*
```js
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

```

## Step Four: **Update Form**
Again in the `src/frontend/edit.jsx` file, we are going to make some changes in template form to switch from a `<Textfield>` to a `<Select>` which uses the Star Wars planets you fetched in the previous step.  We will also update the submission to select the value property, as our field is a string.

** Don't forget to add `Select` and `HelperMessage` to the imports from `@forge/react` module.

*This adds the selection dropdown, and you can also see the `<HelperMessage>{"\u00a0"}</HelperMessage>` work around padding.  10 of these seems to add a good amount of space.*
```js
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
        {/* These are only needed for the issue-view, to workaround that padding issue*/}
        <HelperMessage>{"\u00a0"}</HelperMessage>
    </FormSection>
```

*The second section of form components is used for the issue creation screen.  When updated it should look like this.*
```js
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
```

*Now all that is needed is a small adjustment in the submission to safely select the `value` property of the object.*
```js
await view.submit(fieldName?.value || null);
```


## Step Five: **Optional - Update Displayed Value**
The content of the `src/frontend/index.jsx` file is used to render the value of the field on an issue.  Only a small change is needed here to switch out the `Hello World` bits.

*I've additional added some default text to show when the value is null.*
```js
<Text>{`${fieldValue || 'Please choose a planet'}`}</Text>
```

## Step Six: **Deploy and Enjoy!**
That should be it for the code changes, you'll now need to run `forge deploy` to deploy it up to Forge, and then `forge install` to install it to the instance you'd like to test with.

If you need to make any tweaks or updates, you only need to run `forge deploy` afterwards, unless there were manifest changes.