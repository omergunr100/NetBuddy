import {useEffect, useState} from "react";
import Collapsible from 'react-collapsible';
import Button from '@mui/material/Button';
import getActions, {Action} from "../../api/actions/Actions.ts";
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMore from "@mui/icons-material/ExpandMore";

function groupByCategory(items:Action[]) {
  // Use reduce to group the items by category
  const grouped = items.reduce((acc:{[key:string]:Action[]}, item) => {
    // If the category hasn't been seen before, initialize it with an empty array
    if (!acc[item.Category]) {
      acc[item.Category] = [];
    }

    // Push the current item into the array for its category
    acc[item.Category].push(item);
    return acc;
  }, {});

  // Convert the grouped object into an array of arrays
  return Object.values(grouped);
}

const SequenceScreen = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  useEffect(() => {
    getActions().then(setActions)
   
  }, []);
  const grouped = groupByCategory(actions);
  return (
    <div>
      <h1>Select a Sequence</h1>
      {grouped.map(actionGroup=> (
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
          >
            {actionGroup[0].Category}
          </AccordionSummary>
          <AccordionDetails>
            { 
              actionGroup.map(action => {
                return (
                  <Button onClick={e => {
                    e.preventDefault();
                    setSelected([...selected,action.DisplayName]);
                  }}>
                    {action.DisplayName}
                  </Button>
                )
              })
            }
          </AccordionDetails>
        </Accordion>
      ))}
      <ul>
        {selected.map((action,i) => <li key={`${action}-${i}`}>{action}</li>)}
      </ul>
    </div>
  );
};

export default SequenceScreen;
