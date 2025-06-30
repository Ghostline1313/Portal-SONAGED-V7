import { useState } from 'react';
import { Database, Table, ArrowRight, ChevronDown, ChevronRight, Key, Link as LinkIcon } from 'lucide-react';

interface TableSchema {
  name: string;
  description: string;
  columns: {
    name: string;
    type: string;
    constraints: string[];
    description?: string;
  }[];
  relationships?: {
    table: string;
    type: 'one-to-many' | 'many-to-one' | 'many-to-many';
    through?: string;
    description: string;
  }[];
}

const schema: TableSchema[] = [
  {
    name: 'users',
    description: 'Stores user account information and authentication details',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT uuid_generate_v4()'] },
      { name: 'username', type: 'VARCHAR(50)', constraints: ['UNIQUE', 'NOT NULL'] },
      { name: 'email', type: 'VARCHAR(255)', constraints: ['UNIQUE', 'NOT NULL'] },
      { name: 'password_hash', type: 'VARCHAR(255)', constraints: ['NOT NULL'] },
      { name: 'first_name', type: 'VARCHAR(100)', constraints: [] },
      { name: 'last_name', type: 'VARCHAR(100)', constraints: [] },
      { name: 'role', type: 'VARCHAR(20)', constraints: ['NOT NULL', "CHECK (role IN ('admin', 'geomatician', 'viewer'))"] },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', constraints: ['DEFAULT CURRENT_TIMESTAMP'] },
      { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', constraints: ['DEFAULT CURRENT_TIMESTAMP'] }
    ]
  },
  {
    name: 'regions',
    description: 'Geographic regions for territorial organization',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT uuid_generate_v4()'] },
      { name: 'name', type: 'VARCHAR(100)', constraints: ['NOT NULL'] },
      { name: 'code', type: 'VARCHAR(10)', constraints: ['UNIQUE', 'NOT NULL'] }
    ],
    relationships: [
      { table: 'departments', type: 'one-to-many', description: 'A region has many departments' }
    ]
  },
  {
    name: 'departments',
    description: 'Administrative departments within regions',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT uuid_generate_v4()'] },
      { name: 'region_id', type: 'UUID', constraints: ['REFERENCES regions(id)'] },
      { name: 'name', type: 'VARCHAR(100)', constraints: ['NOT NULL'] },
      { name: 'code', type: 'VARCHAR(10)', constraints: ['UNIQUE', 'NOT NULL'] }
    ],
    relationships: [
      { table: 'regions', type: 'many-to-one', description: 'Each department belongs to one region' },
      { table: 'communes', type: 'one-to-many', description: 'A department has many communes' }
    ]
  },
  {
    name: 'communes',
    description: 'Local municipalities within departments',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT uuid_generate_v4()'] },
      { name: 'department_id', type: 'UUID', constraints: ['REFERENCES departments(id)'] },
      { name: 'name', type: 'VARCHAR(100)', constraints: ['NOT NULL'] },
      { name: 'code', type: 'VARCHAR(10)', constraints: ['UNIQUE', 'NOT NULL'] }
    ],
    relationships: [
      { table: 'departments', type: 'many-to-one', description: 'Each commune belongs to one department' },
      { table: 'collection_points', type: 'one-to-many', description: 'A commune has many collection points' },
      { table: 'sweeping_routes', type: 'one-to-many', description: 'A commune has many sweeping routes' },
      { table: 'urban_furniture', type: 'one-to-many', description: 'A commune has many urban furniture items' }
    ]
  },
  {
    name: 'collection_points',
    description: 'Waste collection locations and their characteristics',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT uuid_generate_v4()'] },
      { name: 'name', type: 'VARCHAR(200)', constraints: ['NOT NULL'] },
      { name: 'type', type: 'VARCHAR(50)', constraints: ['NOT NULL', "CHECK (type IN ('container', 'bin', 'center'))"] },
      { name: 'latitude', type: 'DECIMAL(10, 8)', constraints: ['NOT NULL'] },
      { name: 'longitude', type: 'DECIMAL(11, 8)', constraints: ['NOT NULL'] },
      { name: 'commune_id', type: 'UUID', constraints: ['REFERENCES communes(id)'] },
      { name: 'capacity_kg', type: 'DECIMAL(10, 2)', constraints: ['NOT NULL'] },
      { name: 'waste_type', type: 'VARCHAR(50)', constraints: ['NOT NULL', "CHECK (waste_type IN ('general', 'recyclable', 'organic', 'hazardous'))"] },
      { name: 'status', type: 'VARCHAR(50)', constraints: ["DEFAULT 'active'", "CHECK (status IN ('active', 'inactive', 'maintenance'))"] },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', constraints: ['DEFAULT CURRENT_TIMESTAMP'] },
      { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', constraints: ['DEFAULT CURRENT_TIMESTAMP'] }
    ],
    relationships: [
      { table: 'communes', type: 'many-to-one', description: 'Each collection point belongs to one commune' },
      { table: 'collection_history', type: 'one-to-many', description: 'A collection point has many collection records' }
    ]
  },
  {
    name: 'collection_history',
    description: 'Historical records of waste collections',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT uuid_generate_v4()'] },
      { name: 'collection_point_id', type: 'UUID', constraints: ['REFERENCES collection_points(id)'] },
      { name: 'collection_date', type: 'TIMESTAMP WITH TIME ZONE', constraints: ['NOT NULL'] },
      { name: 'quantity_kg', type: 'DECIMAL(10, 2)', constraints: ['NOT NULL'] },
      { name: 'vehicle_id', type: 'UUID', constraints: ['REFERENCES vehicles(id)'] },
      { name: 'operator_id', type: 'UUID', constraints: ['REFERENCES users(id)'] },
      { name: 'notes', type: 'TEXT', constraints: [] }
    ],
    relationships: [
      { table: 'collection_points', type: 'many-to-one', description: 'Each collection record belongs to one collection point' },
      { table: 'vehicles', type: 'many-to-one', description: 'Each collection record is associated with one vehicle' },
      { table: 'users', type: 'many-to-one', description: 'Each collection record is associated with one operator' }
    ]
  }
];

const DatabaseSchema = () => {
  const [expandedTables, setExpandedTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => 
      prev.includes(tableName)
        ? prev.filter(t => t !== tableName)
        : [...prev, tableName]
    );
  };

  const getTableSchema = (tableName: string) => {
    return schema.find(t => t.name === tableName);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-green-600">Structure de la Base de Données</h1>
        <p className="text-gray-600 mt-1">
          Schéma complet de la base de données SONAGED pour la gestion des déchets
        </p>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Table List */}
        <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center text-green-600 font-medium">
              <Database size={18} className="mr-2" />
              Tables
            </div>
          </div>
          <div className="p-2">
            {schema.map(table => (
              <button
                key={table.name}
                onClick={() => {
                  setSelectedTable(table.name);
                  toggleTable(table.name);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${
                  selectedTable === table.name
                    ? 'bg-green-50 text-green-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <Table size={16} className="mr-2 text-gray-400" />
                  <span className="font-medium">{table.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Table Details */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-y-auto">
          {selectedTable ? (
            <div className="h-full">
              {/* Table Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-green-600">{selectedTable}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {getTableSchema(selectedTable)?.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Table Content */}
              <div className="p-4">
                {/* Columns */}
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Colonnes</h3>
                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nom
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contraintes
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getTableSchema(selectedTable)?.columns.map((column, index) => (
                          <tr key={column.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <div className="flex items-center">
                                {column.constraints.includes('PRIMARY KEY') && (
                                  <Key size={14} className="text-yellow-500 mr-1.5" />
                                )}
                                {column.constraints.some(c => c.includes('REFERENCES')) && (
                                  <LinkIcon size={14} className="text-blue-500 mr-1.5" />
                                )}
                                {column.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {column.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex flex-wrap gap-1">
                                {column.constraints.map((constraint, i) => (
                                  <span
                                    key={i}
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                      constraint.includes('PRIMARY KEY')
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : constraint.includes('REFERENCES')
                                        ? 'bg-blue-100 text-blue-800'
                                        : constraint.includes('UNIQUE')
                                        ? 'bg-purple-100 text-purple-800'
                                        : constraint.includes('NOT NULL')
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    {constraint}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Relationships */}
                {getTableSchema(selectedTable)?.relationships && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Relations</h3>
                    <div className="space-y-3">
                      {getTableSchema(selectedTable)?.relationships?.map((rel, index) => (
                        <div
                          key={index}
                          className="flex items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="mr-3">
                            <ArrowRight size={16} className="text-gray-400" />
                          </div>
                          <div>
                            <div className="flex items-center">
                              <span className="font-medium text-gray-900">{rel.table}</span>
                              <span className="mx-2 text-gray-400">•</span>
                              <span className="text-sm text-gray-600">{rel.type}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{rel.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <p>Sélectionnez une table pour voir ses détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseSchema;