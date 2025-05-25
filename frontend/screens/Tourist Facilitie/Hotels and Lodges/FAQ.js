import React from 'react';
import { 
  Box, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const FAQ = ({ questions }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#00ADB5', mb: 3 }}>
        Frequently Asked Question
      </Typography>
      
      {questions.map((faq, index) => (
        <React.Fragment key={index}>
          <Accordion sx={{ 
            backgroundColor: '#393E46',
            color: '#EEEEEE',
            '&:before': { backgroundColor: 'transparent' }
          }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#00ADB5' }} />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
            >
              <Typography sx={{ fontWeight: 'bold' }}>{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
          {index < questions.length - 1 && (
            <Divider sx={{ borderColor: '#2D333B' }} />
          )}
        </React.Fragment>
      ))}
    </Box>
  );
};

export default FAQ;