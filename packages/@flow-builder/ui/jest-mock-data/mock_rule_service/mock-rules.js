export const ASSIGN_COUNT = 'assignCount';
export const mockRules = [
    {
        ruleType: 'assignment',
        left: {
            paramType: 'Data',
            dataType: 'Date',
            collection: false,
            canBeSobjectField: 'CanBe',
            canBeSystemVariable: 'CanBe',
            canBeApexProperty: 'CanBe',
            cannotBeElements: ['CHOICE', 'CHOICELOOKUP', 'CONSTANT', 'FORMULA', 'SCREENFIELD']
        },
        operator: 'Assign',
        rhsParams: [
            {
                paramType: 'Data',
                dataType: 'Date',
                collection: false,
                canBeSobjectField: 'CanBe',
                canBeSystemVariable: 'CanBe',
                canBeApexProperty: 'CanBe'
            },
            {
                paramType: 'Data',
                dataType: 'DateTime',
                collection: false,
                canBeSobjectField: 'CanBe',
                canBeSystemVariable: 'CanBe',
                canBeApexProperty: 'CanBe'
            }
        ],
        includeElems: [],
        excludeElems: []
    },
    {
        ruleType: 'assignment',
        left: {
            paramType: 'Data',
            dataType: 'DateTime',
            collection: false,
            canBeSobjectField: 'CanBe',
            canBeSystemVariable: 'CanBe',
            canBeApexProperty: 'CanBe',
            canBeElements: ['VARIABLE'],
            cannotBeElements: ['CHOICE', 'CHOICELOOKUP', 'CONSTANT', 'FORMULA', 'SCREENFIELD']
        },
        operator: 'Assign',
        rhsParams: [
            {
                paramType: 'Data',
                dataType: 'Date',
                collection: false,
                canBeSobjectField: 'CanBe',
                canBeSystemVariable: 'CanBe',
                canBeApexProperty: 'CanBe'
            },
            {
                paramType: 'Data',
                dataType: 'DateTime',
                collection: false,
                canBeSobjectField: 'CanBe',
                canBeSystemVariable: 'CanBe',
                canBeApexProperty: 'CanBe',
                canBeElements: ['CHOICE', 'CHOICELOOKUP', 'CONSTANT', 'FORMULA', 'SCREENFIELD', 'VARIABLE']
            }
        ],
        includeElems: [],
        excludeElems: ['ASSIGNMENT']
    },
    {
        ruleType: 'assignment',
        left: {
            paramType: 'Element',
            mustBeElements: ['STAGE'],
            collection: true,
            canBeSobjectField: 'CannotBe',
            canBeSystemVariable: 'MustBe',
            canBeApexProperty: 'CanBe'
        },
        operator: 'Equals',
        rhsParams: [
            {
                paramType: 'Element',
                mustBeElements: ['STAGE'],
                collection: false,
                canBeSobjectField: 'CannotBe',
                canBeSystemVariable: 'CanBe',
                canBeApexProperty: 'CanBe'
            }
        ],
        includeElems: [],
        excludeElems: []
    },
    {
        ruleType: 'comparison',
        left: {
            paramType: 'Element',
            mustBeElements: ['STAGE'],
            collection: false,
            canBeSobjectField: 'CannotBe',
            canBeSystemVariable: 'MustBe',
            canBeApexProperty: 'CanBe'
        },
        operator: 'Equals',
        rhsParams: [
            {
                paramType: 'Element',
                mustBeElements: ['STAGE'],
                collection: false,
                canBeSobjectField: 'CannotBe',
                canBeSystemVariable: 'CanBe',
                canBeApexProperty: 'CanBe'
            }
        ],
        includeElems: [],
        excludeElems: ['DECISION']
    },
    // duplicate rule needed for testing removal of duplicates.
    // there will never be a direct copy of a rule, just duplicates on LHS or Operator
    {
        ruleType: 'comparison',
        left: {
            paramType: 'Element',
            mustBeElements: ['STAGE'],
            collection: false,
            canBeSobjectField: 'CannotBe',
            canBeSystemVariable: 'MustBe',
            canBeApexProperty: 'CanBe'
        },
        operator: 'Equals',
        rhsParams: [
            {
                paramType: 'Element',
                dataType: 'DateTime',
                collection: false,
                canBeSobjectField: 'CannotBe',
                canBeSystemVariable: 'CanBe',
                canBeApexProperty: 'CanBe'
            }
        ],
        includeElems: [],
        excludeElems: []
    },
    {
        ruleType: 'assignment',
        left: {
            paramType: 'Data',
            dataType: 'SObject',
            collection: false,
            canBeSobjectField: 'CannotBe',
            canBeSystemVariable: 'CanBe',
            canBeApexProperty: 'CanBe'
        },
        operator: 'Assign',
        rhsParams: [
            {
                paramType: 'Data',
                dataType: 'SObject',
                collection: false,
                canBeSobjectField: 'CannotBe',
                canBeSystemVariable: 'CanBe',
                canBeApexProperty: 'CanBe'
            }
        ],
        includeElems: [],
        excludeElems: []
    },
    {
        ruleType: 'comparison',
        left: {
            paramType: 'Element',
            mustBeElements: ['STAGE'],
            collection: false,
            canBeSobjectField: 'CannotBe',
            canBeSystemVariable: 'MustBe',
            canBeApexProperty: 'CanBe'
        },
        operator: 'Equals',
        rhsParams: [
            {
                paramType: 'Element',
                mustBeElements: ['STAGE'],
                collection: false,
                canBeSobjectField: 'CannotBe',
                canBeSystemVariable: 'CanBe',
                canBeApexProperty: 'CanBe'
            }
        ],
        includeElems: [],
        excludeElems: []
    },
    {
        ruleType: 'comparison',
        left: {
            paramType: 'Element',
            collection: true,
            mustBeElements: ['STAGE'],
            canBeSobjectField: 'CannotBe',
            canBeSystemVariable: 'MustBe',
            canBeApexProperty: 'CanBe'
        },
        operator: 'Equals',
        rhsParams: [
            {
                paramType: 'Element',
                dataType: 'DateTime',
                collection: true,
                canBeSobjectField: 'CannotBe',
                canBeSystemVariable: 'CanBe',
                canBeApexProperty: 'CanBe'
            }
        ],
        includeElems: [],
        excludeElems: []
    }
];

export const mockAssignCount = [
    {
        ruleType: 'assignment',
        left: {
            paramType: 'Data',
            dataType: 'Number',
            collection: false,
            null: false,
            canBeSobjectField: 'CanBe',
            canBeSystemVariable: 'CanBe',
            canBeApexProperty: 'CanBe'
        },
        operator: ASSIGN_COUNT,
        rhsParams: [
            {
                paramType: 'Data',
                dataType: 'SObject',
                collection: true,
                null: false,
                canBeSobjectField: 'CanBe',
                canBeSystemVariable: 'CanBe',
                canBeApexProperty: 'CanBe'
            }
        ],
        includeElems: [],
        excludeElems: []
    }
];
