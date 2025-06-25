import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Plus, Search, MapPin, Calendar, Drill } from 'lucide-react'
import { toast } from 'sonner'

export default function DrillHoles() {
  const [drillHoles, setDrillHoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newHole, setNewHole] = useState({
    hole_id: '',
    project_name: '',
    location_x: '',
    location_y: '',
    elevation: '',
    azimuth: '',
    dip: '',
    total_depth: '',
    drilling_company: ''
  })

  useEffect(() => {
    fetchDrillHoles()
  }, [])

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

  const handleAddHole = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:5001/api/drill-holes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newHole,
          location_x: newHole.location_x ? parseFloat(newHole.location_x) : null,
          location_y: newHole.location_y ? parseFloat(newHole.location_y) : null,
          elevation: newHole.elevation ? parseFloat(newHole.elevation) : null,
          azimuth: newHole.azimuth ? parseFloat(newHole.azimuth) : null,
          dip: newHole.dip ? parseFloat(newHole.dip) : null,
          total_depth: newHole.total_depth ? parseFloat(newHole.total_depth) : null,
        }),
      })

      if (response.ok) {
        toast.success('Drill hole added successfully')
        setShowAddDialog(false)
        setNewHole({
          hole_id: '',
          project_name: '',
          location_x: '',
          location_y: '',
          elevation: '',
          azimuth: '',
          dip: '',
          total_depth: '',
          drilling_company: ''
        })
        fetchDrillHoles()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add drill hole')
      }
    } catch (error) {
      console.error('Error adding drill hole:', error)
      toast.error('Failed to add drill hole')
    }
  }

  const filteredHoles = drillHoles.filter(hole =>
    hole.hole_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hole.project_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <h2 className="text-3xl font-bold text-gray-900">Drill Holes</h2>
          <p className="text-gray-600 mt-1">Manage drill hole information and locations</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Drill Hole
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Drill Hole</DialogTitle>
              <DialogDescription>
                Enter the details for the new drill hole
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddHole} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hole_id">Hole ID *</Label>
                  <Input
                    id="hole_id"
                    value={newHole.hole_id}
                    onChange={(e) => setNewHole({...newHole, hole_id: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="project_name">Project Name *</Label>
                  <Input
                    id="project_name"
                    value={newHole.project_name}
                    onChange={(e) => setNewHole({...newHole, project_name: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="location_x">Easting (X)</Label>
                  <Input
                    id="location_x"
                    type="number"
                    step="0.01"
                    value={newHole.location_x}
                    onChange={(e) => setNewHole({...newHole, location_x: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="location_y">Northing (Y)</Label>
                  <Input
                    id="location_y"
                    type="number"
                    step="0.01"
                    value={newHole.location_y}
                    onChange={(e) => setNewHole({...newHole, location_y: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="elevation">Elevation</Label>
                  <Input
                    id="elevation"
                    type="number"
                    step="0.01"
                    value={newHole.elevation}
                    onChange={(e) => setNewHole({...newHole, elevation: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="azimuth">Azimuth (°)</Label>
                  <Input
                    id="azimuth"
                    type="number"
                    step="0.1"
                    min="0"
                    max="360"
                    value={newHole.azimuth}
                    onChange={(e) => setNewHole({...newHole, azimuth: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="dip">Dip (°)</Label>
                  <Input
                    id="dip"
                    type="number"
                    step="0.1"
                    min="-90"
                    max="90"
                    value={newHole.dip}
                    onChange={(e) => setNewHole({...newHole, dip: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="total_depth">Total Depth (m)</Label>
                  <Input
                    id="total_depth"
                    type="number"
                    step="0.01"
                    value={newHole.total_depth}
                    onChange={(e) => setNewHole({...newHole, total_depth: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="drilling_company">Drilling Company</Label>
                <Input
                  id="drilling_company"
                  value={newHole.drilling_company}
                  onChange={(e) => setNewHole({...newHole, drilling_company: e.target.value})}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Drill Hole</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search drill holes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Drill Holes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Drill Holes ({filteredHoles.length})</CardTitle>
          <CardDescription>
            Overview of all drill holes in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hole ID</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Depth</TableHead>
                <TableHead>Azimuth/Dip</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHoles.map((hole) => (
                <TableRow key={hole.id}>
                  <TableCell className="font-medium">{hole.hole_id}</TableCell>
                  <TableCell>{hole.project_name}</TableCell>
                  <TableCell>
                    {hole.location_x && hole.location_y ? (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-xs">
                          {hole.location_x.toFixed(2)}, {hole.location_y.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {hole.total_depth ? `${hole.total_depth}m` : 'Not set'}
                  </TableCell>
                  <TableCell>
                    {hole.azimuth && hole.dip ? (
                      <div className="flex items-center space-x-1">
                        <Drill className="w-3 h-3 text-gray-400" />
                        <span className="text-xs">
                          {hole.azimuth}°/{hole.dip}°
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>{hole.drilling_company || 'Not specified'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Active</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredHoles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No drill holes found. Add your first drill hole to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

