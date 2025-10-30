// articleService.js - Functions for article management

import { apiRequest, uploadWithAuth } from './apiUtils';

/**
 * Create a new article with file uploads
 * @param {Object} articleData - Article data
 * @param {File} imageFile - Optional image file
 * @param {File} videoFile - Optional video file
 * @returns {Promise} Response data
 */
export const createArticle = async (articleData, imageFile = null, videoFile = null) => {
  try {
    // Create FormData for the request
    const formData = new FormData();
    
    // Add all article data fields to FormData
    Object.entries(articleData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    
    // Add files if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    if (videoFile) {
      formData.append('video', videoFile);
    }
    
    // Send request with authentication
    const response = await uploadWithAuth('/api/articles/', formData);
    
    if (!response.ok) {
      // Parse error response
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to create article: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating article:', error);
    throw error;
  }
}

/**
 * Update an existing article
 * @param {number} articleId - ID of the article to update
 * @param {Object} articleData - Updated article data
 * @param {File} imageFile - Optional new image file
 * @param {File} videoFile - Optional new video file
 * @returns {Promise} Response data
 */
export const updateArticle = async (articleId, articleData, imageFile = null, videoFile = null) => {
  try {
    const formData = new FormData();
    
    // Add all article data fields to FormData
    Object.entries(articleData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    
    // Add files if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    if (videoFile) {
      formData.append('video', videoFile);
    }
    
    // Send request with authentication
    const response = await uploadWithAuth(`/api/articles/${articleId}`, formData);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to update article: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating article:', error);
    throw error;
  }
}

export default {
  createArticle,
  updateArticle
};