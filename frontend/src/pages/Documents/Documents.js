import React, { useState, useEffect, useContext } from 'react';
import { Link } from "react-router-dom";
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  IconButton
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download'
import { AuthContext } from '../../context/AuthContext';
import { getDocuments, downloadDocument } from '../../api/documents';

const Documents = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await getDocuments();
                setDocuments(response.data);
                setLoading(false);
            } catch (error) {
                setError('Ошибка при загрузке документов');
                console.error('Ошибка при загрузке документов:', error);
                setLoading(false);
            } finally {
                setLoading(false);
            }
        };
        
        if (isAuthenticated) {
            fetchDocuments();
        } else {
            setLoading(false);
        }
        
    }, [isAuthenticated]);

    const handleDownload = async (documentId, fileName) => {
        try {
          setError(null);
          const response = await downloadDocument(documentId);
          
          // Создаем временную ссылку для скачивания
          const blobUrl = window.URL.createObjectURL(response.data);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.setAttribute('download', fileName || 'document');
          document.body.appendChild(link);
          link.click();
          
          // Очистка
          setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(link);
          }, 100);
        } catch (error) {
          console.error('Download error:', error);
          setError(error.message);
        }
      };

    const getDocumentTypeName = (type) => {
        const types = {
            'ord': 'Организационно-распорядительная документация',
            'instructions': 'Инструкция'
        };
        return types[type] || type;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    };

    if (error) {
        return (
          <Box sx={{ mt: 4 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        );
    };

    return (
        <Box sx={{ mt: 4, p: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Документы
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Тип документа</TableCell>
                  <TableCell>Дата создания</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>{document.title}</TableCell>
                    <TableCell>{getDocumentTypeName(document.document_type)}</TableCell>
                    <TableCell>
                      {new Date(document.created_at).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell align="right">
                      {document.file && (
                        <IconButton
                            color="primary"
                            aria-label="скачать"
                            onClick={() => handleDownload(document.id, document.title)}
                        >
                            <DownloadIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      );
    };
    
    export default Documents;