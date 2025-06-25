import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { QrCode, Scan, Package, MapPin, Clock, CheckCircle, AlertCircle, Camera, Plus } from 'lucide-react'
import { toast } from 'sonner'

export default function TrayTracking() {
  const [trays, setTrays] = useState([])
  const [loading, setLoading] = useState(true)
  const [scanMode, setScanMode] = useState(false)
  const [scannedCode, setScannedCode] = useState('')
  const [newTray, setNewTray] = useState({
    trayId: '',
    drillHole: '',
    coreRun: '',
    fromDepth: '',
    toDepth: '',
    location: '',
    status: 'active'
  })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [report, setReport] = useState("");
  const [generating, setGenerating] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading tray data
    setTimeout(() => {
      setTrays([
        {
          id: 1,
          trayId: 'TR-001',
          barcode: '1234567890123',
          rfidTag: 'RFID-001',
          drillHole: 'DH-001',
          coreRun: 'Run 1',
          fromDepth: 0,
          toDepth: 5,
          location: 'Core Shed A - Rack 1',
          status: 'active',
          lastScanned: '2025-06-21 10:30:00',
          photos: 3,
          notes: 'Good core recovery'
        },
        {
          id: 2,
          trayId: 'TR-002',
          barcode: '1234567890124',
          rfidTag: 'RFID-002',
          drillHole: 'DH-001',
          coreRun: 'Run 1',
          fromDepth: 5,
          toDepth: 10,
          location: 'Core Shed A - Rack 1',
          status: 'logged',
          lastScanned: '2025-06-21 11:15:00',
          photos: 2,
          notes: 'Fractured zone'
        },
        {
          id: 3,
          trayId: 'TR-003',
          barcode: '1234567890125',
          rfidTag: 'RFID-003',
          drillHole: 'DH-001',
          coreRun: 'Run 2',
          fromDepth: 30,
          toDepth: 35,
          location: 'Core Shed B - Rack 2',
          status: 'archived',
          lastScanned: '2025-06-20 16:45:00',
          photos: 4,
          notes: 'Mineralized zone'
        },
        {
          id: 4,
          trayId: 'TR-004',
          barcode: '1234567890127',
          rfidTag: 'RFID-003',
          drillHole: 'DH-001',
          coreRun: 'Run 2',
          fromDepth: 30,
          toDepth: 35,
          location: 'Core Shed D - Rack 2',
          status: 'archived',
          lastScanned: '2025-06-20 16:45:00',
          photos: 4,
          notes: 'Poor core recovery'
        },
         {
          id: 5,
          trayId: 'TR-004',
          barcode: '1234567890127',
          rfidTag: 'RFID-003',
          drillHole: 'DH-001',
          coreRun: 'Run 2',
          fromDepth: 30,
          toDepth: 35,
          location: 'Core Shed D - Rack 2',
          status: 'archived',
          lastScanned: '2025-06-20 16:45:00',
          photos: 4,
          notes: 'Poor core recovery'
        },
        {
          id: 6,
          trayId: 'TR-004',
          barcode: '1234567890127',
          rfidTag: 'RFID-003',
          drillHole: 'DH-001',
          coreRun: 'Run 2',
          fromDepth: 30,
          toDepth: 35,
          location: 'Core Shed D - Rack 2',
          status: 'archived',
          lastScanned: '2025-06-20 16:45:00',
          photos: 4,
          notes: 'Poor core recovery'
        }

      ])
      setLoading(false)
    }, 1000)
  }, [])

  const handleScan = () => {
    setScanMode(true)
    // Simulate barcode/RFID scanning
    setTimeout(() => {
      const mockCodes = ['1234567890123', '1234567890124', '1234567890125', '1234567890126'
                        ,'1234567890127', '1234567890128', '1234567890129', '1234567890130']
      const randomCode = mockCodes[Math.floor(Math.random() * mockCodes.length)]
      setScannedCode(randomCode)
      setScanMode(false)
      
      // Find tray by barcode
      const foundTray = trays.find(tray => tray.barcode === randomCode)
      if (foundTray) {
        toast.success(`Tray ${foundTray.trayId} scanned successfully`)
        // Update last scanned time
        setTrays(prev => prev.map(tray => 
          tray.barcode === randomCode 
            ? { ...tray, lastScanned: new Date().toLocaleString() }
            : tray
        ))
      } else {
        toast.error('Tray not found in database')
      }
    }, 2000)
  }

  const generateBarcode = () => {
    return Math.floor(Math.random() * 9000000000000) + 1000000000000
  }

  const generateRFID = () => {
    return `RFID-${Math.floor(Math.random() * 900) + 100}`
  }

  const handleAddTray = () => {
    const tray = {
      id: trays.length + 1,
      ...newTray,
      barcode: generateBarcode().toString(),
      rfidTag: generateRFID(),
      lastScanned: new Date().toLocaleString(),
      photos: 0,
      notes: ''
    }
    
    setTrays([...trays, tray])
    setNewTray({
      trayId: '',
      drillHole: '',
      coreRun: '',
      fromDepth: '',
      toDepth: '',
      location: '',
      status: 'active'
    })
    setShowAddDialog(false)
    toast.success(`Tray ${tray.trayId} added successfully`)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'logged': return 'bg-blue-100 text-blue-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'logged': return <Package className="w-4 h-4" />
      case 'archived': return <AlertCircle className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Tray Tracking</h2>
          <p className="text-gray-600 mt-1">Barcode/RFID-based core tray management and tracking</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleScan} disabled={scanMode} className="flex items-center space-x-2">
            <Scan className="w-4 h-4" />
            <span>{scanMode ? 'Scanning...' : 'Scan Tray'}</span>
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Tray</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Core Tray</DialogTitle>
                <DialogDescription>
                  Create a new core tray with barcode and RFID tracking
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tray-id">Tray ID</Label>
                  <Input
                    id="tray-id"
                    value={newTray.trayId}
                    onChange={(e) => setNewTray({...newTray, trayId: e.target.value})}
                    placeholder="e.g., TR-004"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="drill-hole">Drill Hole</Label>
                    <Input
                      id="drill-hole"
                      value={newTray.drillHole}
                      onChange={(e) => setNewTray({...newTray, drillHole: e.target.value})}
                      placeholder="e.g., DH-001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="core-run">Core Run</Label>
                    <Input
                      id="core-run"
                      value={newTray.coreRun}
                      onChange={(e) => setNewTray({...newTray, coreRun: e.target.value})}
                      placeholder="e.g., Run 1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="from-depth">From Depth (m)</Label>
                    <Input
                      id="from-depth"
                      type="number"
                      value={newTray.fromDepth}
                      onChange={(e) => setNewTray({...newTray, fromDepth: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="to-depth">To Depth (m)</Label>
                    <Input
                      id="to-depth"
                      type="number"
                      value={newTray.toDepth}
                      onChange={(e) => setNewTray({...newTray, toDepth: e.target.value})}
                      placeholder="5"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Storage Location</Label>
                  <Input
                    id="location"
                    value={newTray.location}
                    onChange={(e) => setNewTray({...newTray, location: e.target.value})}
                    placeholder="e.g., Core Shed A - Rack 1"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTray}>Add Tray</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Scanning Status */}
      {scanMode && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div>
                <p className="font-medium text-blue-900">Scanning for barcode/RFID...</p>
                <p className="text-sm text-blue-700">Position the scanner near the tray</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recently Scanned */}
      {scannedCode && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Scan Successful</p>
                <p className="text-sm text-green-700">Barcode: {scannedCode}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Trays</p>
                <p className="text-2xl font-bold text-gray-900">{trays.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Trays</p>
                <p className="text-2xl font-bold text-gray-900">
                  {trays.filter(t => t.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <QrCode className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Scanned Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {trays.filter(t => t.lastScanned.includes('2025-06-21')).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Locations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(trays.map(t => t.location.split(' - ')[0])).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tray Management Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Trays</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="logged">Logged</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <TrayTable trays={trays} />
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          <TrayTable trays={trays.filter(t => t.status === 'active')} />
        </TabsContent>
        
        <TabsContent value="logged" className="space-y-4">
          <TrayTable trays={trays.filter(t => t.status === 'logged')} />
        </TabsContent>
        
        <TabsContent value="archived" className="space-y-4">
          <TrayTable trays={trays.filter(t => t.status === 'archived')} />
        </TabsContent>
      </Tabs>

      {/* Generate Report Button */}
      <Button
        onClick={async () => {
          setGenerating(true);
          const result = await generateGeminiReport(trays); // or filter/format as needed
          setReport(result);
          setGenerating(false);
        }}
        disabled={generating}
        className="mt-4"
      >
        {generating ? "Generating Report..." : "Generate AI Report"}
      </Button>

      {/* AI Report Card */}
      {report && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>AI-Generated Geological Report</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap">{report}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function TrayTable({ trays }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'logged': return 'bg-blue-100 text-blue-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'logged': return <Package className="w-4 h-4" />
      case 'archived': return <AlertCircle className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Core Tray Inventory</CardTitle>
        <CardDescription>
          Track and manage core trays with barcode/RFID integration
        </CardDescription>
      </CardHeader>
      <CardContent>
        {trays.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No trays found</p>
            <p className="text-sm mt-2">Add trays or scan existing ones to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tray ID</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>RFID Tag</TableHead>
                  <TableHead>Drill Hole</TableHead>
                  <TableHead>Depth Range</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Scanned</TableHead>
                  <TableHead>Photos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trays.map((tray) => (
                  <TableRow key={tray.id}>
                    <TableCell className="font-medium">{tray.trayId}</TableCell>
                    <TableCell className="font-mono text-sm">{tray.barcode}</TableCell>
                    <TableCell className="font-mono text-sm">{tray.rfidTag}</TableCell>
                    <TableCell>{tray.drillHole}</TableCell>
                    <TableCell>{tray.fromDepth}m - {tray.toDepth}m</TableCell>
                    <TableCell>{tray.location}</TableCell>
                    <TableCell>
                      <Badge className={`flex items-center space-x-1 ${getStatusColor(tray.status)}`}>
                        {getStatusIcon(tray.status)}
                        <span className="capitalize">{tray.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{tray.lastScanned}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Camera className="w-4 h-4 text-gray-400" />
                        <span>{tray.photos}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

async function generateGeminiReport(observations) {
  const apiKey = "AIzaSyCE6c5_vkYHu7IC2SZWDIaWAyF2RLnfFK0";
  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash:generateContent?key=" + apiKey;

  const prompt = `Generate a detailed geological report based on these core tray observations:\n${JSON.stringify(observations, null, 2)}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    console.log('Gemini API response:', data);
    if (data.error) {
      return `Gemini API Error: ${data.error.message || JSON.stringify(data.error)}`;
    }
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }
    return `No report generated. Raw response: ${JSON.stringify(data)}`;
  } catch (err) {
    console.error('Gemini API call failed:', err);
    return `Gemini API call failed: ${err.message}`;
  }
}

