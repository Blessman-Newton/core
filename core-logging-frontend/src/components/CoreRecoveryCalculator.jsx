import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Calculator, Camera, Upload, Download, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function CoreRecoveryCalculator() {
  const [drillHoles, setDrillHoles] = useState([])
  const [selectedHole, setSelectedHole] = useState('')
  const [coreRuns, setCoreRuns] = useState([])
  const [selectedRun, setSelectedRun] = useState('')
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  
  // Manual calculation state
  const [manualCalc, setManualCalc] = useState({
    runLength: '',
    coreRecovered: '',
    pieces: []
  })
  
  // Photo analysis state
  const [photoAnalysis, setPhotoAnalysis] = useState({
    trayPhoto: null,
    analysisResult: null,
    confidence: 0
  })

  useEffect(() => {
    fetchDrillHoles()
  }, [])

  useEffect(() => {
    if (selectedHole) {
      fetchCoreRuns(selectedHole)
    }
  }, [selectedHole])

  const fetchDrillHoles = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/drill-holes')
      const data = await response.json()
      setDrillHoles(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching drill holes:', error)
      toast.error('Failed to fetch drill holes')
      setLoading(false)
    }
  }

  const fetchCoreRuns = async (holeId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/core-runs?drill_hole_id=${holeId}`)
      const data = await response.json()
      setCoreRuns(data)
    } catch (error) {
      console.error('Error fetching core runs:', error)
      toast.error('Failed to fetch core runs')
    }
  }

  const calculateTCR = (runLength, coreRecovered) => {
    if (!runLength || !coreRecovered) return 0
    return ((parseFloat(coreRecovered) / parseFloat(runLength)) * 100).toFixed(2)
  }

  const calculateRQD = (pieces) => {
    if (!pieces || pieces.length === 0) return 0
    const totalLength = pieces.reduce((sum, piece) => sum + parseFloat(piece.length || 0), 0)
    const rqdLength = pieces
      .filter(piece => parseFloat(piece.length || 0) >= 10) // RQD only counts pieces >= 10cm
      .reduce((sum, piece) => sum + parseFloat(piece.length || 0), 0)
    
    return totalLength > 0 ? ((rqdLength / totalLength) * 100).toFixed(2) : 0
  }

  const handleManualCalculation = () => {
    setCalculating(true)
    
    // Simulate calculation process
    setTimeout(() => {
      const tcr = calculateTCR(manualCalc.runLength, manualCalc.coreRecovered)
      const rqd = calculateRQD(manualCalc.pieces)
      
      toast.success(`Calculation complete: TCR = ${tcr}%, RQD = ${rqd}%`)
      setCalculating(false)
    }, 1500)
  }

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setPhotoAnalysis({
        ...photoAnalysis,
        trayPhoto: file
      })
      
      // Simulate AI photo analysis
      setCalculating(true)
      setTimeout(() => {
        const mockResult = {
          detectedPieces: Math.floor(Math.random() * 20) + 10,
          totalLength: (Math.random() * 25 + 20).toFixed(1),
          rqdLength: (Math.random() * 20 + 15).toFixed(1),
          tcr: (Math.random() * 20 + 80).toFixed(1),
          rqd: (Math.random() * 30 + 60).toFixed(1)
        }
        
        setPhotoAnalysis({
          ...photoAnalysis,
          trayPhoto: file,
          analysisResult: mockResult,
          confidence: Math.floor(Math.random() * 20) + 80
        })
        
        setCalculating(false)
        toast.success('Photo analysis complete')
      }, 3000)
    }
  }

  const addPiece = () => {
    setManualCalc({
      ...manualCalc,
      pieces: [...manualCalc.pieces, { length: '', condition: 'intact', notes: '' }]
    })
  }

  const updatePiece = (index, field, value) => {
    const updatedPieces = [...manualCalc.pieces]
    updatedPieces[index][field] = value
    setManualCalc({
      ...manualCalc,
      pieces: updatedPieces
    })
  }

  const removePiece = (index) => {
    const updatedPieces = manualCalc.pieces.filter((_, i) => i !== index)
    setManualCalc({
      ...manualCalc,
      pieces: updatedPieces
    })
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
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Core Recovery Calculator</h2>
        <p className="text-gray-600 mt-1">Automated TCR and RQD calculation with photo analysis</p>
      </div>

      {/* Selection Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Select Core Run</CardTitle>
          <CardDescription>Choose the core run to calculate recovery metrics for</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="drill-hole">Drill Hole</Label>
              <Select value={selectedHole} onValueChange={setSelectedHole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select drill hole" />
                </SelectTrigger>
                <SelectContent>
                  {drillHoles.map((hole) => (
                    <SelectItem key={hole.id} value={hole.id.toString()}>
                      {hole.hole_id} - {hole.project_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="core-run">Core Run</Label>
              <Select value={selectedRun} onValueChange={setSelectedRun} disabled={!selectedHole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select core run" />
                </SelectTrigger>
                <SelectContent>
                  {coreRuns.map((run) => (
                    <SelectItem key={run.id} value={run.id.toString()}>
                      Run {run.run_number} ({run.from_depth}m - {run.to_depth}m)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculation Methods */}
      {selectedRun && (
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual">Manual Calculation</TabsTrigger>
            <TabsTrigger value="photo">Photo Analysis</TabsTrigger>
            <TabsTrigger value="results">Results & Export</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="w-5 h-5" />
                  <span>Manual Core Recovery Calculation</span>
                </CardTitle>
                <CardDescription>
                  Enter measurements manually for precise TCR and RQD calculation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="run-length">Run Length (m)</Label>
                    <Input
                      id="run-length"
                      type="number"
                      step="0.01"
                      value={manualCalc.runLength}
                      onChange={(e) => setManualCalc({...manualCalc, runLength: e.target.value})}
                      placeholder="e.g., 3.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="core-recovered">Total Core Recovered (m)</Label>
                    <Input
                      id="core-recovered"
                      type="number"
                      step="0.01"
                      value={manualCalc.coreRecovered}
                      onChange={(e) => setManualCalc({...manualCalc, coreRecovered: e.target.value})}
                      placeholder="e.g., 2.85"
                    />
                  </div>
                </div>

                {/* Live TCR Calculation */}
                {manualCalc.runLength && manualCalc.coreRecovered && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Core Recovery (TCR):</span>
                      <Badge variant="secondary" className="text-lg">
                        {calculateTCR(manualCalc.runLength, manualCalc.coreRecovered)}%
                      </Badge>
                    </div>
                    <Progress 
                      value={parseFloat(calculateTCR(manualCalc.runLength, manualCalc.coreRecovered))} 
                      className="mt-2" 
                    />
                  </div>
                )}

                {/* Core Pieces for RQD */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Core Pieces (for RQD calculation)</Label>
                    <Button onClick={addPiece} size="sm">Add Piece</Button>
                  </div>
                  
                  {manualCalc.pieces.length > 0 && (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {manualCalc.pieces.map((piece, index) => (
                        <div key={index} className="grid grid-cols-4 gap-2 p-2 border rounded">
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Length (cm)"
                            value={piece.length}
                            onChange={(e) => updatePiece(index, 'length', e.target.value)}
                          />
                          <Select 
                            value={piece.condition} 
                            onValueChange={(value) => updatePiece(index, 'condition', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="intact">Intact</SelectItem>
                              <SelectItem value="fractured">Fractured</SelectItem>
                              <SelectItem value="broken">Broken</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Notes"
                            value={piece.notes}
                            onChange={(e) => updatePiece(index, 'notes', e.target.value)}
                          />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => removePiece(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Live RQD Calculation */}
                  {manualCalc.pieces.length > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg mt-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Rock Quality Designation (RQD):</span>
                        <Badge variant="secondary" className="text-lg">
                          {calculateRQD(manualCalc.pieces)}%
                        </Badge>
                      </div>
                      <Progress 
                        value={parseFloat(calculateRQD(manualCalc.pieces))} 
                        className="mt-2" 
                      />
                      <div className="text-xs text-gray-600 mt-1">
                        Based on {manualCalc.pieces.filter(p => parseFloat(p.length || 0) >= 10).length} pieces ≥ 10cm
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleManualCalculation} 
                  disabled={calculating || !manualCalc.runLength || !manualCalc.coreRecovered}
                  className="w-full"
                >
                  {calculating ? 'Calculating...' : 'Calculate Recovery Metrics'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="photo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span>AI-Powered Photo Analysis</span>
                </CardTitle>
                <CardDescription>
                  Upload core tray photos for automated measurement and calculation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">Upload Core Tray Photo</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Supports JPG, PNG, WebP formats. Max 10MB.
                    </p>
                  </label>
                </div>

                {calculating && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg font-medium">Analyzing photo...</p>
                    <p className="text-sm text-gray-500">AI is detecting and measuring core pieces</p>
                  </div>
                )}

                {photoAnalysis.analysisResult && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Analysis Complete</span>
                      <Badge variant="secondary">
                        {photoAnalysis.confidence}% confidence
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {photoAnalysis.analysisResult.detectedPieces}
                        </div>
                        <div className="text-sm text-gray-600">Pieces Detected</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {photoAnalysis.analysisResult.totalLength}cm
                        </div>
                        <div className="text-sm text-gray-600">Total Length</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {photoAnalysis.analysisResult.tcr}%
                        </div>
                        <div className="text-sm text-gray-600">TCR</div>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {photoAnalysis.analysisResult.rqd}%
                        </div>
                        <div className="text-sm text-gray-600">RQD</div>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800">Review Recommended</p>
                          <p className="text-sm text-yellow-700">
                            AI analysis provides estimates. Please verify measurements manually for critical applications.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Results & Export</span>
                </CardTitle>
                <CardDescription>
                  View calculated results and export data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Download className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Results and export functionality</p>
                  <p className="text-sm mt-2">Export to CSV, Excel, or Leapfrog-compatible formats</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

