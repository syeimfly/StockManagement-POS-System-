import { useEffect, useRef, useState } from 'react'
import { API_BASE } from '../api'
import './Pos.css'

const CAN_DETECT_BARCODES = 'BarcodeDetector' in window

function Pos() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState({}) // productId -> quantity
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(false)
  const [manualEntry, setManualEntry] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)

  function loadProducts() {
    fetch(`${API_BASE}/products`)
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => setError('Could not load products'))
  }

  useEffect(loadProducts, [])

  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search)
  )

  const cartItems = Object.entries(cart)
    .map(([id, quantity]) => ({ product: products.find((p) => p.id === Number(id)), quantity }))
    .filter((line) => line.product)
  const cartCount = cartItems.reduce((sum, line) => sum + line.quantity, 0)
  const total = cartItems.reduce((sum, line) => sum + line.product.price * line.quantity, 0)

  function addToCart(product) {
    if (product.stock_quantity === 0) return
    setCart((prev) => {
      const current = prev[product.id] || 0
      if (current >= product.stock_quantity) return prev
      return { ...prev, [product.id]: current + 1 }
    })
  }

  function removeFromCart(productId) {
    setCart((prev) => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
  }

  async function lookupBarcode(code) {
    const res = await fetch(`${API_BASE}/products/barcode/${encodeURIComponent(code)}`)
    if (!res.ok) {
      setError(`No product found for barcode ${code}`)
      return
    }
    setError('')
    addToCart(await res.json())
  }

  function stopScan() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setScanning(false)
  }

  async function startScan() {
    if (!CAN_DETECT_BARCODES) {
      setManualEntry(true)
      return
    }
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    } catch {
      setError('Could not access the camera')
      return
    }
    setScanning(true)
  }

  useEffect(() => {
    if (!scanning) return undefined
    const video = videoRef.current
    video.srcObject = streamRef.current
    video.play()
    const detector = new window.BarcodeDetector()
    const interval = setInterval(async () => {
      try {
        const [result] = await detector.detect(video)
        if (result) {
          stopScan()
          lookupBarcode(result.rawValue)
        }
      } catch {
        // frame not ready yet, try again on the next tick
      }
    }, 300)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning])

  async function handleUploadChange(e) {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    if (!CAN_DETECT_BARCODES) {
      setManualEntry(true)
      return
    }
    const bitmap = await createImageBitmap(file)
    const detector = new window.BarcodeDetector()
    const [result] = await detector.detect(bitmap)
    if (!result) {
      setError('No barcode found in that image')
      return
    }
    lookupBarcode(result.rawValue)
  }

  function submitManualCode(e) {
    e.preventDefault()
    setManualEntry(false)
    lookupBarcode(manualCode)
    setManualCode('')
  }

  async function confirmPayment() {
    if (cartItems.length === 0) return
    const res = await fetch(`${API_BASE}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartItems.map((line) => ({ product_id: line.product.id, quantity: line.quantity })),
      }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.detail || 'Could not complete sale')
      return
    }
    const sale = await res.json()
    window.location.href = `${API_BASE}/sales/${sale.id}/receipt`
    setCart({})
    setError('')
    loadProducts()
  }

  return (
    <div className="pos-page">
      <div className="pos-header">
        <h1>POS</h1>
        <span className="cart-badge">🛒 {cartCount}</span>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="barcode-actions">
        <button onClick={startScan}>Scan barcode</button>
        <button onClick={() => fileInputRef.current.click()}>Upload barcode</button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleUploadChange}
        />
      </div>

      {scanning && (
        <div className="modal-overlay" onClick={stopScan}>
          <div className="scan-modal" onClick={(e) => e.stopPropagation()}>
            <video ref={videoRef} className="scan-video" muted playsInline />
            <button onClick={stopScan}>Cancel</button>
          </div>
        </div>
      )}

      {manualEntry && (
        <div className="modal-overlay" onClick={() => setManualEntry(false)}>
          <form className="scan-modal" onClick={(e) => e.stopPropagation()} onSubmit={submitManualCode}>
            <p>Camera barcode scanning isn't supported in this browser. Enter the barcode:</p>
            <input
              autoFocus
              placeholder="Barcode"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
            />
            <button type="submit">Look up</button>
          </form>
        </div>
      )}

      <input
        className="search-bar"
        placeholder="Search by name or barcode"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="product-grid">
        {filtered.map((p) => (
          <button
            key={p.id}
            className={'product-tile' + (p.stock_quantity === 0 ? ' disabled' : '')}
            disabled={p.stock_quantity === 0}
            onClick={() => addToCart(p)}
          >
            <div className="tile-name">{p.name}</div>
            <div className="tile-price">${Number(p.price).toFixed(2)}</div>
            <div className="tile-stock">{p.stock_quantity === 0 ? 'Out of stock' : `${p.stock_quantity} in stock`}</div>
          </button>
        ))}
      </div>

      <div className="cart-section">
        <h2>Cart</h2>
        {cartItems.length === 0 && <p className="empty-state">Cart is empty</p>}
        <ul className="cart-list">
          {cartItems.map((line) => (
            <li className="cart-line" key={line.product.id}>
              <span>{line.product.name} x{line.quantity}</span>
              <span>${(line.product.price * line.quantity).toFixed(2)}</span>
              <button className="remove-btn" onClick={() => removeFromCart(line.product.id)}>Remove</button>
            </li>
          ))}
        </ul>
        <div className="cart-total">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <button className="confirm-btn" disabled={cartItems.length === 0} onClick={confirmPayment}>
          Confirm payment
        </button>
      </div>
    </div>
  )
}

export default Pos
