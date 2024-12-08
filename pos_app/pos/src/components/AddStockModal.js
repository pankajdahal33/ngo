// AddStockModal.js
import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function AddStockModal({ show, onHide, products, stockAddition, handleStockInputChange, handleAddStock, handelRemoveStock }) {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Add Stock</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formProduct">
            <Form.Label>Product</Form.Label>
            <Form.Control
              as="select"
              name="product"
              value={stockAddition.product}
              onChange={handleStockInputChange}
            >
              <option value="">Select Product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="formQuantity">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              name="quantity"
              placeholder='Enter quantity'
              value={stockAddition.quantity}
              onChange={handleStockInputChange}
            />
          </Form.Group>
          <Form.Group controlId="formRemarks">
            <Form.Label>Remarks</Form.Label>
            <Form.Control
              type="text"
              name="remarks"
              placeholder='Enter remarks'
              value={stockAddition.remarks}
              onChange={handleStockInputChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="danger" onClick={handelRemoveStock}>
          Remove Stock
        </Button>
        <Button variant="primary" onClick={handleAddStock}>
          Add Stock
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddStockModal;