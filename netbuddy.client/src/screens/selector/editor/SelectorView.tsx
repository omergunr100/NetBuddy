﻿import {useEffect, useState} from "react";
import {SaveSelector, Selector} from "../../../api/selectors/selectors.ts";
import Grid from "@mui/material/Grid";
import AdvancedView from "./AdvancedView.tsx";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";
import StageItem from "./StageItem.tsx";
import AttributeList from "./AttributeList.tsx";

export type SelectorViewProps = {
  save: boolean;
  setSave: (save: boolean) => void;
  selector?: Selector;
  setSelector: (selector?: Selector) => void;
};

const SelectorView = (props: SelectorViewProps) => {
  const {
    save, setSave, selector, setSelector
  } = props;

  const [selectorEdit, setSelectorEdit] = useState<Selector | undefined>(selector);
  const [advanced, setAdvanced] = useState<boolean>(false);
  const [stageIndex, setStageIndex] = useState<number | undefined>(selector?.stages.length);

  useEffect(() => {
    setStageIndex(undefined);
    setAdvanced(false);
  }, [selector]);

  useEffect(() => {
    if (!save) return;
    setSave(false);
    selectorEdit !== undefined && SaveSelector(selectorEdit).then();
    selectorEdit !== undefined && setSelector({...selectorEdit});
  }, [save]);

  return (
    <Grid container direction="column" spacing={2} paddingTop={1}>
      <Grid item key="identifier">
        <Paper elevation={2}>
          <Stack direction="row" spacing={1}>
            <TextField
              label="Name"
              fullWidth
              sx={{input: {textAlign: "center"}}}
              value={selectorEdit?.name}
              onChange={e => selectorEdit ? setSelectorEdit({...selectorEdit, name: e.target.value}) : null}
            />
            <Tooltip title="Advanced">
              <Checkbox value={advanced} onChange={() => setAdvanced(!advanced)}/>
            </Tooltip>
          </Stack>
        </Paper>
      </Grid>
      {
        advanced ?
          <Grid item key="advanced">
            <Paper elevation={2}>
              <AdvancedView choice={selectorEdit}/>
            </Paper>
          </Grid>
          :
          null
      }
      <Grid item key="editor">
        <Grid container direction="row">
          <Grid item key="stages" xs={4}>
            <Paper elevation={2} style={{overflow: "auto"}}>
              {
                selector?.stages.map((stage, index) =>
                  <StageItem
                    stage={stage}
                    select={() => setStageIndex(index)}
                    setInUse={(inUse: boolean) => {
                      selectorEdit && setSelectorEdit({
                        ...selectorEdit,
                        stages: selectorEdit.stages.map((stage, i) => i === index ? {...stage, inUse} : stage)
                      })
                    }}
                  />
                )
              }
            </Paper>
          </Grid>
          <Grid item key="attributes" xs={8}>
            <Paper elevation={2} style={{overflow: "auto"}}>
              <AttributeList stageIndex={stageIndex} selector={selectorEdit} setSelector={setSelectorEdit}/>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default SelectorView;