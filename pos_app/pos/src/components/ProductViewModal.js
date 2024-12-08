// src/components/ProductViewModal.js

import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function ProductViewModal({ show, onClose, product }) {
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Product Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {product && (
          <div>
            <p><strong>Name:</strong> {product.name}</p>
            <p><strong>Description:</strong> {product.description}</p>
            <p><strong>SKU:</strong> {product.sku}</p>
            <p><strong>Barcode:</strong> {product.barcode}</p>
            <p><strong>Price:</strong> {product.price}</p>
            <p><strong>Cost Price:</strong> {product.cost_price}</p>
            <p><strong>Quantity:</strong> {product.quantity}</p>
            <p><strong>Reorder Level:</strong> {product.reorder_level}</p>
            <p><strong>Reorder Quantity:</strong> {product.reorder_quantity}</p>
            <p><strong>Expiration Date:</strong> {new Date(product.expiration_date).toLocaleDateString()}</p>
            <p><strong>Category:</strong> {product.category.name}</p>
            <p><strong>Supplier:</strong> {product.supplier.name}</p>
            <p><strong>Created At:</strong> {new Date(product.created_at).toLocaleString()}</p>
            <p><strong>Updated At:</strong> {new Date(product.updated_at).toLocaleString()}</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ProductViewModal;
