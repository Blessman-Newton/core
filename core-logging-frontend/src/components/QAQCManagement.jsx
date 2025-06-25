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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './/ui/table'
import { Textarea } from './ui/textarea'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  FileText, 
  Flag,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  User,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'

export default function QAQCManagement() {
  const [qcItems, setQcItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newQcItem, setNewQcItem] = useState({
    title: '',
    description: '',
    type: '',
    priority: 'medium',
    assignedTo: '',
    drillHole: '',
    coreRun: ''
  })

  // Mock QA/QC data
  useEffect(() => {
    setTimeout(() => {
      setQcItems([
        {
          id: 1,
          title: 'Core Recovery Discrepancy',
          description: 'TCR calculation shows 95% but visual inspection suggests lower recovery',
          type: 'data_validation',
          priority: 'high',
          status: 'open',
          assignedTo: 'John Smith',
          drillHole: 'DH-001',
          coreRun: 'Run 1',
          createdDate: '2025-06-20',
          dueDate: '2025-06-22',
          comments: 2,
          attachments: 1
        },
        {
          id: 2,
          title: 'Missing Lithology Data',
          description: 'Intervals 15-20m lack detailed lithology descriptions',
          type: 'data_completeness',
          priority: 'medium',
          status: 'in_progress',
          assignedTo: 'Sarah Johnson',
          drillHole: 'DH-001',
          coreRun: 'Run 2',
          createdDate: '2025-06-19',
          dueDate: '2025-06-21',
          comments: 1,
          attachments: 0
        },
        {
          id: 3,
          title: 'Photo Quality Issue',
          description: 'Core tray photos for TR-003 are blurry and need retaking',
          type: 'photo_quality',
          priority: 'low',
          status: 'resolved',
          assignedTo: 'Mike Wilson',
          drillHole: 'DH-002',
          coreRun: 'Run 1',
          createdDate: '2025-06-18',
          dueDate: '2025-06-20',
          comments: 3,
          attachments: 2
        },
        {
          id: 4,
          title: 'Depth Measurement Verification',
          description: 'Cross-check depth measurements with drilling logs',
          type: 'measurement_check',
          priority: 'high',
          status: 'pending_review',
          assignedTo: 'Lisa Chen',
          drillHole: 'DH-001',
          coreRun: 'Run 3',
          createdDate: '2025-06-21',
          dueDate: '2025-06-23',
          comments: 0,
          attachments: 1
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'pending_review': return 'bg-blue-100 text-blue-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <AlertTriangle className="w-4 h-4" />
      case 'in_progress': return <Clock className="w-4 h-4" />
      case 'pending_review': return <Eye className="w-4 h-4" />
      case 'resolved': return <CheckCircle className="w-4 h-4" />
      default: return <Flag className="w-4 h-4" />
    }
  }

  const handleAddQcItem = () => {
    const qcItem = {
      id: qcItems.length + 1,
      ...newQcItem,
      status: 'open',
      createdDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      comments: 0,
      attachments: 0
    }
    
    setQcItems([...qcItems, qcItem])
    setNewQcItem({
      title: '',
      description: '',
      type: '',
      priority: 'medium',
      assignedTo: '',
      drillHole: '',
      coreRun: ''
    })
    setShowAddDialog(false)
    toast.success('QA/QC item created successfully')
  }

  const filteredItems = qcItems.filter(item => {
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus
    const matchesPriority = selectedPriority === 'all' || item.priority === selectedPriority
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.drillHole.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesPriority && matchesSearch
  })

  const getQcStats = () => {
    return {
      total: qcItems.length,
      open: qcItems.filter(item => item.status === 'open').length,
      inProgress: qcItems.filter(item => item.status === 'in_progress').length,
      pendingReview: qcItems.filter(item => item.status === 'pending_review').length,
      resolved: qcItems.filter(item => item.status === 'resolved').length,
      highPriority: qcItems.filter(item => item.priority === 'high').length
    }
  }

  const stats = getQcStats()

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
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
          <h2 className="text-3xl font-bold text-gray-900">QA/QC Management</h2>
          <p className="text-gray-600 mt-1">Quality assurance and quality control for core logging operations</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export QC Report</span>
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add QC Item</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create QA/QC Item</DialogTitle>
                <DialogDescription>
                  Add a new quality assurance or quality control item for tracking
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newQcItem.title}
                    onChange={(e) => setNewQcItem({...newQcItem, title: e.target.value})}
                    placeholder="Brief description of the issue"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newQcItem.description}
                    onChange={(e) => setNewQcItem({...newQcItem, description: e.target.value})}
                    placeholder="Detailed description of the QA/QC issue"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={newQcItem.type} onValueChange={(value) => setNewQcItem({...newQcItem, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="data_validation">Data Validation</SelectItem>
                        <SelectItem value="data_completeness">Data Completeness</SelectItem>
                        <SelectItem value="photo_quality">Photo Quality</SelectItem>
                        <SelectItem value="measurement_check">Measurement Check</SelectItem>
                        <SelectItem value="procedure_compliance">Procedure Compliance</SelectItem>
                        <SelectItem value="equipment_calibration">Equipment Calibration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newQcItem.priority} onValueChange={(value) => setNewQcItem({...newQcItem, priority: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="assigned-to">Assigned To</Label>
                    <Input
                      id="assigned-to"
                      value={newQcItem.assignedTo}
                      onChange={(e) => setNewQcItem({...newQcItem, assignedTo: e.target.value})}
                      placeholder="Person responsible"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="drill-hole">Drill Hole</Label>
                    <Input
                      id="drill-hole"
                      value={newQcItem.drillHole}
                      onChange={(e) => setNewQcItem({...newQcItem, drillHole: e.target.value})}
                      placeholder="e.g., DH-001"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="core-run">Core Run</Label>
                    <Input
                      id="core-run"
                      value={newQcItem.coreRun}
                      onChange={(e) => setNewQcItem({...newQcItem, coreRun: e.target.value})}
                      placeholder="e.g., Run 1"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddQcItem}>Create QC Item</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open</p>
                <p className="text-2xl font-bold text-red-600">{stats.open}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-blue-600">{stats.pendingReview}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
              </div>
              <Flag className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search QC items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="text-sm text-gray-600">
              Showing {filteredItems.length} of {qcItems.length} items
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QC Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>QA/QC Items</CardTitle>
          <CardDescription>
            Track and manage quality assurance and quality control items
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No QC items found</p>
              <p className="text-sm mt-2">Create new QC items or adjust your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-gray-600 truncate max-w-xs">
                            {item.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {item.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`flex items-center space-x-1 ${getPriorityColor(item.priority)}`}>
                          <span className="capitalize">{item.priority}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`flex items-center space-x-1 ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          <span className="capitalize">{item.status.replace('_', ' ')}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{item.assignedTo}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{item.drillHole}</div>
                          <div className="text-gray-600">{item.coreRun}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{item.dueDate}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <FileText className="w-4 h-4" />
                            <span>{item.comments}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Upload className="w-4 h-4" />
                            <span>{item.attachments}</span>
                          </div>
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
    </div>
  )
}

