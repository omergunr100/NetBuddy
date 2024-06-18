import {Sequence, SequenceVariable,} from "../../../api/sequences/sequences.ts";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import {useState} from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import DownloadSequencePopup from "../builder/DownloadSequencePopup.tsx";
import {Action} from "./Action.tsx";
import {ExecutionButton} from "./ExecutionButton.tsx";
import mapSequenceVarToInput from "./inputs/inputMappings.ts";
import {jsx} from "@emotion/react";
import {PutPipeline} from "../../../api/pipelines/pipelines.ts";
import JSX = jsx.JSX;

const ExecutionScreen = () => {
  const [isOpen, setOpen] = useState<boolean>(false);
  const [sequence, setSequence] = useState<Sequence>();
  const [values, setValues] = useState<Record<string, any>>({});

  const handleSequenceSelect = (sequence: Sequence) => {
    setSequence(sequence);
    setOpen(false);
  }

  const actionElementsToShow = (): { components: JSX.Element[], inputs: string[] } => {
    const seen = new Set<string>();
    let components: JSX.Element[] = [];
    let inputs: string[] = [];
    return sequence?.actions.reduce(({components, inputs}, action) => {
      // get list of all inputs that aren't filled by a previous action
      const relevant = (input: SequenceVariable) =>
        !seen.has(input.name) && input.type.split("[]", 1).some(t => t in mapSequenceVarToInput);
      const relevantInputs = action.inputs.filter(relevant);
      // if the list isn't empty
      if (relevantInputs.length > 0) {
        // add the inputs to the names list to keep track of
        inputs.unshift(...relevantInputs.map(input => input.name));
        // add the inputs in the list to the seen set because we are handling them
        relevantInputs.forEach(input => seen.add(input.name));
        // create a component to represent this action
        components.push(<Action key={action.id} inputsToFill={relevantInputs} action={action}
                                createSetValue={createSetValue}/>)
      }
      // add all the outputs generated by this action to the seen set because they'll be filled after this action
      action.outputs.forEach(output => seen.add(output.name));
      return {components, inputs};
    }, {components, inputs}) ?? {components, inputs};
  };

  const createSetValue = (field: string) => {
    return (value?: any) => {
      if (value !== undefined) setValues({...values, [field]: value});
      else {
        const {[field]: _, ...rest} = values;
        setValues(rest);
      }
    }
  }

  const {components, inputs} = actionElementsToShow();

  return (
    <div>
      <Box display="flex" flexDirection="column" justifyContent="center" justifyItems="center" alignItems="center"
           mb={2}>
        <Button onClick={() => setOpen(true)}>Select sequence</Button>
        <Typography variant="body1" mr={1}>Selected Sequence: {sequence?.name}</Typography>
      </Box>
      <DownloadSequencePopup open={isOpen} setOpen={setOpen} setSequence={handleSequenceSelect}/>
      {sequence && (
        <Paper elevation={4} sx={{mt: 2}}>
          <Card>
            {
              components.length > 0 &&
                <CardContent>
                    <Typography variant="h6">Inputs to Fill:</Typography>
                    <Stack spacing={2}>
                      {components}
                    </Stack>
                </CardContent>
            }
            <CardActions sx={{justifyContent: 'flex-end'}}>
              <ExecutionButton values={values} inputs={inputs} onClick={async () => {
                await PutPipeline({
                  id: "",
                  sequence,
                  context: values,
                  isFinished: false,
                  isRunning: false
                });
              }}/>
            </CardActions>
          </Card>
        </Paper>
      )}
    </div>
  );
};

export default ExecutionScreen;