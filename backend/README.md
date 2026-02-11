# Phase 1: Product Identification & Data Ingestion Backend

This backend implementation fulfills the requirements of Phase 1 of the IPR Project plan.

## Setup

1.  **Navigate to backend directory:**
    ```bash
    cd backend
    ```

2.  **Create virtual environment (Optional but Recommended):**
    ```bash
    python -m venv venv
    .\venv\Scripts\activate  # Windows
    ```

3.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

    **Note for Windows Users:**
    `pyzbar` requires the Visual C++ Redistributable packages. If you encounter errors like `ImportError: Unable to find zbar shared library`, you may need to install the [Visual C++ Redistributable](https://support.microsoft.com/en-us/help/2977003/the-latest-supported-visual-c-downloads).

4.  **Run the Server:**
    ```bash
    uvicorn app.main:app --reload
    ```
    The server will start at `http://127.0.0.1:8000`.

## API Endpoints

### 1. Barcode Scan
*   **Endpoint:** `POST /scan/barcode`
*   **Body:** JSON
    ```json
    {
      "barcode": "8901234567890"
    }
    ```
*   **Response:** Product JSON with nutrition, ingredients, and additives.

### 2. Image Scan
*   **Endpoint:** `POST /scan/image`
*   **Body:** Form-Data with file upload (`file`).
*   **Functionality:**
    1.  Attempts to find a barcode in the image.
    2.  If no barcode, uses OCR to extract text and searches OpenFoodFacts.

## Project Structure

*   `app/main.py`: Entry point for the FastAPI application.
*   `app/resolvers/`: Contains logic for resolving products from barcodes and images.
    *   `barcode_resolver.py`: Queries OpenFoodFacts API.
    *   `image_resolver.py`: Handles OCR and fuzzy search.
*   `app/utils/`: Utility functions.
    *   `normalizer.py`: standardizes nutrition values and ingredients.
*   `app/models/`: Pydantic models for response schema.
