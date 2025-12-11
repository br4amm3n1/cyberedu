import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Typography, CircularProgress } from '@mui/material';
import api from '../../api/courses';

const MaterialsList = ({ courseId }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await api.get('materials/', {
          params: { course_id: courseId }
        });

        setMaterials(response.data);
      } catch (error) {
        console.error('Error fetching materials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [courseId]);

  if (loading) {
    return <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />;
  }

  return (
    <>
      <Typography variant="h5" gutterBottom>Материалы курса</Typography>
      <List>
        {materials.map((material) => (
          <ListItem key={material.id}>
            <ListItemText
              primary={material.material_type}
              secondary={
                material.material_type === "video" ? (
                  <a href={material.content_url} target="_blank" rel="noopener noreferrer">
                    {material.content_url}
                  </a>
                ) : (
                  material.content_url
                )
              }
            />
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default MaterialsList;