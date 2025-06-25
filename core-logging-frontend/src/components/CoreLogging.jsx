import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Plus, Save, FileText, Camera, Calculator } from 'lucide-react'
import { toast } from 'sonner'

// Geological reference data
const LITHOLOGY_TYPES = [
  'Granite', 'Gneiss', 'Schist', 'Quartzite', 'Sandstone', 'Shale', 'Limestone', 'Dolomite',
  'Basalt', 'Andesite', 'Rhyolite', 'Gabbro', 'Diorite', 'Syenite', 'Pegmatite', 'Aplite'
]

const ALTERATION_TYPES = [
  'Sericitic', 'Argillic', 'Propylitic', 'Potassic', 'Phyllic', 'Silicic', 'Carbonate', 'Chloritic'
]

const ALTERATION_INTENSITY = ['Weak', 'Moderate', 'Strong', 'Intense']

const MINERALIZATION_TYPES = [
  'Disseminated', 'Vein-hosted', 'Stockwork', 'Massive sulfide', 'Skarn', 'Porphyry', 'Epithermal'
]

const MINERAL_ABUNDANCE = ['Trace', 'Minor', 'Moderate', 'Major', 'Dominant']

const ROCK_STRENGTH = ['Very Weak', 'Weak', 'Moderate', 'Strong', 'Very Strong']

export default function CoreLogging() {
  const [drillHoles, setDrillHoles] = useState([])
  const [coreRuns, setCoreRuns] = useState([])
  const [intervals, setIntervals] = useState([])
  const [selectedHole, setSelectedHole] = useState('')
  const [selectedRun, setSelectedRun] = useState('')
  const [showAddInterval, setShowAddInterval] = useState(false)
  const [showAddCoreRun, setShowAddCoreRun] = useState(false);
  const [loading, setLoading] = useState(true)
  
  const [newInterval, setNewInterval] = useState({
    from_depth: '',
    to_depth: '',
    lithology: '',
    lithology_code: '',
    rock_type: '',
    color: '',
    grain_size: '',
    texture: '',
    alteration_type: '',
    alteration_intensity: '',
    alteration_style: '',
    mineralization_type: '',
    mineralization_style: '',
    mineral_abundance: '',
    ore_minerals: '',
    fracture_frequency: '',
    fracture_orientation: '',
    bedding_orientation: '',
    foliation_orientation: '',
    rock_strength: '',
    weathering_grade: '',
    recovery_percentage: '',
    rqd_contribution: '',
    comments: ''
  })

  const [newCoreRun, setNewCoreRun] = useState({
    run_number: '',
    from_depth: '',
    to_depth: '',
    core_recovered_length: '',
    rqd_length: '',
    drilling_date: '',
    logged_by: ''
  });

  useEffect(() => {
    fetchDrillHoles()
  }, [])

  useEffect(() => {
    if (selectedHole) {
      fetchCoreRuns(selectedHole)
    }
  }, [selectedHole])

  useEffect(() => {
    if (selectedRun) {
      fetchIntervals(selectedRun)
    }
  }, [selectedRun])

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

  const fetchIntervals = async (runId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/core-intervals?core_run_id=${runId}`)
      const data = await response.json()
      setIntervals(data)
    } catch (error) {
      console.error('Error fetching intervals:', error)
      toast.error('Failed to fetch intervals')
    }
  }

  const handleAddInterval = async (e) => {
    e.preventDefault()
    if (!selectedRun) {
      toast.error('Please select a core run first')
      return
    }

    try {
      const response = await fetch('http://localhost:5001/api/core-intervals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newInterval,
          core_run_id: parseInt(selectedRun),
          from_depth: parseFloat(newInterval.from_depth),
          to_depth: parseFloat(newInterval.to_depth),
          fracture_frequency: newInterval.fracture_frequency ? parseInt(newInterval.fracture_frequency) : null,
          recovery_percentage: newInterval.recovery_percentage ? parseFloat(newInterval.recovery_percentage) : null,
          rqd_contribution: newInterval.rqd_contribution ? parseFloat(newInterval.rqd_contribution) : null,
          logged_date: new Date().toISOString().split('T')[0]
        }),
      })

      if (response.ok) {
        toast.success('Core interval logged successfully')
        setShowAddInterval(false)
        setNewInterval({
          from_depth: '',
          to_depth: '',
          lithology: '',
          lithology_code: '',
          rock_type: '',
          color: '',
          grain_size: '',
          texture: '',
          alteration_type: '',
          alteration_intensity: '',
          alteration_style: '',
          mineralization_type: '',
          mineralization_style: '',
          mineral_abundance: '',
          ore_minerals: '',
          fracture_frequency: '',
          fracture_orientation: '',
          bedding_orientation: '',
          foliation_orientation: '',
          rock_strength: '',
          weathering_grade: '',
          recovery_percentage: '',
          rqd_contribution: '',
          comments: ''
        })
        fetchIntervals(selectedRun)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to log interval')
      }
    } catch (error) {
      console.error('Error adding interval:', error)
      toast.error('Failed to log interval')
    }
  }

  const handleAddCoreRun = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/api/core-runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drill_hole_id: selectedHole,
          run_number: parseInt(newCoreRun.run_number),
          from_depth: parseFloat(newCoreRun.from_depth),
          to_depth: parseFloat(newCoreRun.to_depth),
          core_recovered_length: parseFloat(newCoreRun.core_recovered_length),
          rqd_length: parseFloat(newCoreRun.rqd_length),
          drilling_date: newCoreRun.drilling_date,
          logged_by: newCoreRun.logged_by
        })
      });
      if (response.ok) {
        toast.success('Core run added!');
        setShowAddCoreRun(false);
        setNewCoreRun({
          run_number: '',
          from_depth: '',
          to_depth: '',
          core_recovered_length: '',
          rqd_length: '',
          drilling_date: '',
          logged_by: ''
        });
        fetchCoreRuns(selectedHole);
      } else {
        const err = await response.json();
        toast.error(err.error || 'Failed to add core run');
      }
    } catch (error) {
      toast.error('Failed to add core run');
    }
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Core Logging</h2>
          <p className="text-gray-600 mt-1">Log geological data for core intervals</p>
        </div>
      </div>

      {/* Selection Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Select Drill Hole and Core Run</CardTitle>
          <CardDescription>Choose the drill hole and core run to log intervals for</CardDescription>
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
          <div className="mt-4 flex gap-2">
            <Dialog open={showAddCoreRun} onOpenChange={setShowAddCoreRun}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Core Run
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Core Run</DialogTitle>
                  <DialogDescription>Enter details for the new core run.</DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      const response = await fetch('http://localhost:5001/api/core-runs', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          drill_hole_id: selectedHole,
                          run_number: parseInt(newCoreRun.run_number),
                          from_depth: parseFloat(newCoreRun.from_depth),
                          to_depth: parseFloat(newCoreRun.to_depth),
                          core_recovered_length: parseFloat(newCoreRun.core_recovered_length),
                          rqd_length: parseFloat(newCoreRun.rqd_length),
                          drilling_date: newCoreRun.drilling_date,
                          logged_by: newCoreRun.logged_by
                        })
                      });
                      if (response.ok) {
                        toast.success('Core run added!');
                        setShowAddCoreRun(false);
                        setNewCoreRun({
                          run_number: '',
                          from_depth: '',
                          to_depth: '',
                          core_recovered_length: '',
                          rqd_length: '',
                          drilling_date: '',
                          logged_by: ''
                        });
                        fetchCoreRuns(selectedHole);
                      } else {
                        const err = await response.json();
                        toast.error(err.error || 'Failed to add core run');
                      }
                    } catch (error) {
                      toast.error('Failed to add core run');
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label>Run Number</Label>
                    <Input type="number" value={newCoreRun.run_number} onChange={e => setNewCoreRun({ ...newCoreRun, run_number: e.target.value })} required />
                  </div>
                  <div>
                    <Label>From Depth (m)</Label>
                    <Input type="number" value={newCoreRun.from_depth} onChange={e => setNewCoreRun({ ...newCoreRun, from_depth: e.target.value })} required />
                  </div>
                  <div>
                    <Label>To Depth (m)</Label>
                    <Input type="number" value={newCoreRun.to_depth} onChange={e => setNewCoreRun({ ...newCoreRun, to_depth: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Core Recovered Length (m)</Label>
                    <Input type="number" value={newCoreRun.core_recovered_length} onChange={e => setNewCoreRun({ ...newCoreRun, core_recovered_length: e.target.value })} required />
                  </div>
                  <div>
                    <Label>RQD Length (m)</Label>
                    <Input type="number" value={newCoreRun.rqd_length} onChange={e => setNewCoreRun({ ...newCoreRun, rqd_length: e.target.value })} />
                  </div>
                  <div>
                    <Label>Drilling Date</Label>
                    <Input type="date" value={newCoreRun.drilling_date} onChange={e => setNewCoreRun({ ...newCoreRun, drilling_date: e.target.value })} />
                  </div>
                  <div>
                    <Label>Barcode</Label>
                    <Input />
                  </div>
                  <div>
                    <Label>Logged By</Label>
                    <Input value={newCoreRun.logged_by} onChange={e => setNewCoreRun({ ...newCoreRun, logged_by: e.target.value })} />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit">Add Core Run</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {selectedRun && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {coreRuns.find(r => r.id.toString() === selectedRun) && (
                  <>
                    <div>
                      <span className="font-medium">Run Length:</span>
                      <div>{coreRuns.find(r => r.id.toString() === selectedRun).run_length}m</div>
                    </div>
                    <div>
                      <span className="font-medium">Core Recovery:</span>
                      <div>{coreRuns.find(r => r.id.toString() === selectedRun).total_core_recovery}%</div>
                    </div>
                    <div>
                      <span className="font-medium">RQD:</span>
                      <div>{coreRuns.find(r => r.id.toString() === selectedRun).rqd_percentage}%</div>
                    </div>
                    <div>
                      <span className="font-medium">Intervals Logged:</span>
                      <div>{intervals.length}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Core Intervals */}
      {selectedRun && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Core Intervals</CardTitle>
                <CardDescription>Geological logging data for selected core run</CardDescription>
              </div>
              
              <Dialog open={showAddInterval} onOpenChange={setShowAddInterval}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Log Interval
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Log Core Interval</DialogTitle>
                    <DialogDescription>
                      Enter geological data for the core interval
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleAddInterval} className="space-y-6">
                    <Tabs defaultValue="basic" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="lithology">Lithology</TabsTrigger>
                        <TabsTrigger value="alteration">Alteration</TabsTrigger>
                        <TabsTrigger value="structure">Structure</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="basic" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="from_depth">From Depth (m) *</Label>
                            <Input
                              id="from_depth"
                              type="number"
                              step="0.01"
                              value={newInterval.from_depth}
                              onChange={(e) => setNewInterval({...newInterval, from_depth: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="to_depth">To Depth (m) *</Label>
                            <Input
                              id="to_depth"
                              type="number"
                              step="0.01"
                              value={newInterval.to_depth}
                              onChange={(e) => setNewInterval({...newInterval, to_depth: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="recovery_percentage">Recovery (%)</Label>
                            <Input
                              id="recovery_percentage"
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              value={newInterval.recovery_percentage}
                              onChange={(e) => setNewInterval({...newInterval, recovery_percentage: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="rqd_contribution">RQD Contribution (m)</Label>
                            <Input
                              id="rqd_contribution"
                              type="number"
                              step="0.01"
                              value={newInterval.rqd_contribution}
                              onChange={(e) => setNewInterval({...newInterval, rqd_contribution: e.target.value})}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="comments">Comments</Label>
                          <Textarea
                            id="comments"
                            value={newInterval.comments}
                            onChange={(e) => setNewInterval({...newInterval, comments: e.target.value})}
                            rows={3}
                          />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="lithology" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="lithology">Lithology</Label>
                            <Select value={newInterval.lithology} onValueChange={(value) => setNewInterval({...newInterval, lithology: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select lithology" />
                              </SelectTrigger>
                              <SelectContent>
                                {LITHOLOGY_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="lithology_code">Lithology Code</Label>
                            <Input
                              id="lithology_code"
                              value={newInterval.lithology_code}
                              onChange={(e) => setNewInterval({...newInterval, lithology_code: e.target.value})}
                              placeholder="e.g., GR, GN, SC"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="rock_type">Rock Type</Label>
                            <Input
                              id="rock_type"
                              value={newInterval.rock_type}
                              onChange={(e) => setNewInterval({...newInterval, rock_type: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="color">Color</Label>
                            <Input
                              id="color"
                              value={newInterval.color}
                              onChange={(e) => setNewInterval({...newInterval, color: e.target.value})}
                              placeholder="e.g., Light gray, Dark green"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="grain_size">Grain Size</Label>
                            <Input
                              id="grain_size"
                              value={newInterval.grain_size}
                              onChange={(e) => setNewInterval({...newInterval, grain_size: e.target.value})}
                              placeholder="e.g., Fine, Medium, Coarse"
                            />
                          </div>
                          <div>
                            <Label htmlFor="texture">Texture</Label>
                            <Input
                              id="texture"
                              value={newInterval.texture}
                              onChange={(e) => setNewInterval({...newInterval, texture: e.target.value})}
                              placeholder="e.g., Massive, Foliated, Porphyritic"
                            />
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="alteration" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="alteration_type">Alteration Type</Label>
                            <Select value={newInterval.alteration_type} onValueChange={(value) => setNewInterval({...newInterval, alteration_type: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select alteration type" />
                              </SelectTrigger>
                              <SelectContent>
                                {ALTERATION_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="alteration_intensity">Alteration Intensity</Label>
                            <Select value={newInterval.alteration_intensity} onValueChange={(value) => setNewInterval({...newInterval, alteration_intensity: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select intensity" />
                              </SelectTrigger>
                              <SelectContent>
                                {ALTERATION_INTENSITY.map((intensity) => (
                                  <SelectItem key={intensity} value={intensity}>{intensity}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="mineralization_type">Mineralization Type</Label>
                            <Select value={newInterval.mineralization_type} onValueChange={(value) => setNewInterval({...newInterval, mineralization_type: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select mineralization" />
                              </SelectTrigger>
                              <SelectContent>
                                {MINERALIZATION_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="mineral_abundance">Mineral Abundance</Label>
                            <Select value={newInterval.mineral_abundance} onValueChange={(value) => setNewInterval({...newInterval, mineral_abundance: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select abundance" />
                              </SelectTrigger>
                              <SelectContent>
                                {MINERAL_ABUNDANCE.map((abundance) => (
                                  <SelectItem key={abundance} value={abundance}>{abundance}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="ore_minerals">Ore Minerals</Label>
                          <Input
                            id="ore_minerals"
                            value={newInterval.ore_minerals}
                            onChange={(e) => setNewInterval({...newInterval, ore_minerals: e.target.value})}
                            placeholder="e.g., Pyrite, Chalcopyrite, Galena"
                          />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="structure" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="fracture_frequency">Fracture Frequency (/m)</Label>
                            <Input
                              id="fracture_frequency"
                              type="number"
                              value={newInterval.fracture_frequency}
                              onChange={(e) => setNewInterval({...newInterval, fracture_frequency: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="rock_strength">Rock Strength</Label>
                            <Select value={newInterval.rock_strength} onValueChange={(value) => setNewInterval({...newInterval, rock_strength: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select strength" />
                              </SelectTrigger>
                              <SelectContent>
                                {ROCK_STRENGTH.map((strength) => (
                                  <SelectItem key={strength} value={strength}>{strength}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="fracture_orientation">Fracture Orientation</Label>
                            <Input
                              id="fracture_orientation"
                              value={newInterval.fracture_orientation}
                              onChange={(e) => setNewInterval({...newInterval, fracture_orientation: e.target.value})}
                              placeholder="e.g., 045/85"
                            />
                          </div>
                          <div>
                            <Label htmlFor="bedding_orientation">Bedding Orientation</Label>
                            <Input
                              id="bedding_orientation"
                              value={newInterval.bedding_orientation}
                              onChange={(e) => setNewInterval({...newInterval, bedding_orientation: e.target.value})}
                              placeholder="e.g., 120/30"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="foliation_orientation">Foliation Orientation</Label>
                          <Input
                            id="foliation_orientation"
                            value={newInterval.foliation_orientation}
                            onChange={(e) => setNewInterval({...newInterval, foliation_orientation: e.target.value})}
                            placeholder="e.g., 090/75"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setShowAddInterval(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        <Save className="w-4 h-4 mr-2" />
                        Save Interval
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Depth (m)</TableHead>
                  <TableHead>Length (m)</TableHead>
                  <TableHead>Lithology</TableHead>
                  <TableHead>Alteration</TableHead>
                  <TableHead>Mineralization</TableHead>
                  <TableHead>Recovery (%)</TableHead>
                  <TableHead>RQD (m)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {intervals.map((interval) => (
                  <TableRow key={interval.id}>
                    <TableCell className="font-medium">
                      {interval.from_depth} - {interval.to_depth}
                    </TableCell>
                    <TableCell>{interval.interval_length}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{interval.lithology || 'Not specified'}</div>
                        {interval.lithology_code && (
                          <Badge variant="secondary" className="text-xs">{interval.lithology_code}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {interval.alteration_type && (
                        <div>
                          <div>{interval.alteration_type}</div>
                          {interval.alteration_intensity && (
                            <div className="text-xs text-gray-500">{interval.alteration_intensity}</div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {interval.mineralization_type && (
                        <div>
                          <div>{interval.mineralization_type}</div>
                          {interval.mineral_abundance && (
                            <div className="text-xs text-gray-500">{interval.mineral_abundance}</div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{interval.recovery_percentage || '-'}</TableCell>
                    <TableCell>{interval.rqd_contribution || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {intervals.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No intervals logged yet. Start logging geological data for this core run.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          className="mb-4"
          onClick={async () => {
            try {
              const response = await fetch('http://localhost:5001/api/export/csv?type=intervals');
              if (!response.ok) throw new Error('Failed to export CSV');
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'core_intervals.csv';
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
              toast.success('Export started!');
            } catch (err) {
              toast.error('Export failed');
            }
          }}
        >
          Export Intervals to CSV
        </Button>
      </div>
    </div>
  )
}

