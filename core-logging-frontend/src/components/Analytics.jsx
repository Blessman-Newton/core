import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download, 
  Filter,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react'

export default function Analytics() {
  const [selectedProject, setSelectedProject] = useState('all')
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState(null)

  // Fetch summary data
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5001/api/analytics/summary')
      .then(res => res.json())
      .then(data => {
        setAnalyticsData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedProject, selectedTimeRange])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
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
          <h2 className="text-3xl font-bold text-gray-900">Analytics & Reporting</h2>
          <p className="text-gray-600 mt-1">Comprehensive insights into core logging operations and data quality</p>
        </div>
        <div className="flex space-x-3">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="umat">UMaT Gold Exploration</SelectItem>
              <SelectItem value="northern">Northern Prospect</SelectItem>
              <SelectItem value="eastern">Eastern Extension</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drill Holes</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.totalDrillHoles}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Core Runs</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.totalCoreRuns}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Meters Logged</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.totalMetersLogged.toLocaleString()}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Recovery</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.averageRecovery}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg RQD</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.averageRQD}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.activeProjects}</p>
              </div>
              <PieChart className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="recovery" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="recovery">Recovery Trends</TabsTrigger>
          <TabsTrigger value="lithology">Lithology</TabsTrigger>
          <TabsTrigger value="alteration">Alteration</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recovery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Core Recovery Trends</span>
              </CardTitle>
              <CardDescription>
                Monthly trends for Total Core Recovery (TCR) and Rock Quality Designation (RQD)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analyticsData.recoveryTrends.map((data, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{data.month} 2025</span>
                      <div className="flex space-x-4 text-sm">
                        <span className="text-blue-600">TCR: {data.tcr}%</span>
                        <span className="text-green-600">RQD: {data.rqd}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Progress value={data.tcr} className="h-2" />
                      <Progress value={data.rqd} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="lithology" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="w-5 h-5" />
                <span>Lithology Distribution</span>
              </CardTitle>
              <CardDescription>
                Distribution of rock types encountered in core logging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.lithologyDistribution.map((lithology, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: lithology.color }}
                      ></div>
                      <span className="font-medium">{lithology.type}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Progress value={lithology.percentage} className="w-24 h-2" />
                      <span className="text-sm font-medium w-12 text-right">
                        {lithology.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="alteration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Alteration Types</span>
              </CardTitle>
              <CardDescription>
                Frequency and distribution of alteration types observed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.alterationTypes.map((alteration, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">{alteration.type}</span>
                      <Badge variant="secondary">{alteration.count} intervals</Badge>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Progress value={alteration.percentage} className="w-24 h-2" />
                      <span className="text-sm font-medium w-12 text-right">
                        {alteration.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Data Quality Metrics</span>
              </CardTitle>
              <CardDescription>
                Quality assurance and data completeness statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Data Completeness</span>
                      <span className="text-sm font-medium">
                        {analyticsData.qualityMetrics.dataCompleteness}%
                      </span>
                    </div>
                    <Progress value={analyticsData.qualityMetrics.dataCompleteness} className="h-2" />
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-900">Photos Captured</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {analyticsData.qualityMetrics.photosCaptured}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-900">QC Checks</span>
                      <span className="text-2xl font-bold text-green-600">
                        {analyticsData.qualityMetrics.qcChecks}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-orange-900">Pending Review</span>
                      <span className="text-2xl font-bold text-orange-600">
                        {analyticsData.qualityMetrics.pendingReview}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Project Comparison</span>
              </CardTitle>
              <CardDescription>
                Performance metrics across different exploration projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.projectComparison.map((project, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium">{project.project}</h3>
                        <Badge 
                          variant={project.status === 'active' ? 'default' : 'secondary'}
                          className={project.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-600">{project.holes} holes</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Recovery</span>
                          <span className="text-sm font-medium">{project.recovery}%</span>
                        </div>
                        <Progress value={project.recovery} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">RQD</span>
                          <span className="text-sm font-medium">{project.rqd}%</span>
                        </div>
                        <Progress value={project.rqd} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

