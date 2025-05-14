/**
 * Client-side database service that uses our secure API route
 * This abstracts away the complexities of authentication and database access
 */

// Generic types for database operations
type DatabaseInsertParams = {
  table: string;
  data: any;
};

type DatabaseSelectParams = {
  table: string;
  select?: string;
  filters?: Array<{
    column: string;
    operator: string;
    value: any;
  }>;
};

type DatabaseUpdateParams = {
  table: string;
  id: string;
  values: any;
};

type DatabaseDeleteParams = {
  table: string;
  id: string;
};

// Response type
type ApiResponse<T = any> = {
  success?: boolean;
  data?: T;
  error?: string;
};

/**
 * Handles all database operations through our secure server-side API
 */
export const databaseService = {
  /**
   * Insert a new record
   */
  async insert<T = any>(params: DatabaseInsertParams): Promise<ApiResponse<T>> {
    try {
      const response = await fetch('/api/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'insert',
          table: params.table,
          data: params.data,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Insert error:', result.error);
        return { error: result.error };
      }

      return result;
    } catch (error: any) {
      console.error('Database service insert error:', error);
      return { error: error.message || 'Failed to insert data' };
    }
  },

  /**
   * Select records
   */
  async select<T = any>(params: DatabaseSelectParams): Promise<ApiResponse<T[]>> {
    try {
      const response = await fetch('/api/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'select',
          table: params.table,
          data: {
            select: params.select,
            filters: params.filters,
          },
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Select error:', result.error);
        return { error: result.error };
      }

      return result;
    } catch (error: any) {
      console.error('Database service select error:', error);
      return { error: error.message || 'Failed to fetch data' };
    }
  },

  /**
   * Update a record
   */
  async update<T = any>(params: DatabaseUpdateParams): Promise<ApiResponse<T>> {
    try {
      const response = await fetch('/api/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          table: params.table,
          data: {
            id: params.id,
            values: params.values,
          },
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Update error:', result.error);
        return { error: result.error };
      }

      return result;
    } catch (error: any) {
      console.error('Database service update error:', error);
      return { error: error.message || 'Failed to update data' };
    }
  },

  /**
   * Delete a record
   */
  async delete<T = any>(params: DatabaseDeleteParams): Promise<ApiResponse<T>> {
    try {
      const response = await fetch('/api/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          table: params.table,
          data: {
            id: params.id,
          },
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Delete error:', result.error);
        return { error: result.error };
      }

      return result;
    } catch (error: any) {
      console.error('Database service delete error:', error);
      return { error: error.message || 'Failed to delete data' };
    }
  },

  // Helper methods for common operations

  /**
   * Save an idea
   */
  async saveIdea(title: string, description: string, validationScore: number) {
    return this.insert({
      table: 'ideas',
      data: {
        title,
        description,
        validation_score: validationScore,
      },
    });
  },

  /**
   * Save a blueprint
   */
  async saveBlueprint(ideaId: string, blueprint: any) {
    console.log('Saving blueprint for idea:', ideaId);
    
    // Create a complete blueprint object with all fields from the database
    const dbBlueprint = {
      idea_id: ideaId,
      features: blueprint.features || {},
      market: blueprint.market || {},
      technical: blueprint.technical || {},
      validation: blueprint.validation || {},
      userflow: blueprint.userflow || {},
      tasks: blueprint.tasks || [],
      
      // Add all the fields shown in your database schema 
      pricingModel: blueprint.pricingModel || blueprint.pricing || {},
      techStack: blueprint.techStack || blueprint.technology || {},
      targetAudience: blueprint.targetAudience || blueprint.audience || {},
      userExperience: blueprint.userExperience || blueprint.ux || {},
      marketAnalysis: blueprint.marketAnalysis || blueprint.market_analysis || {},
      competitorAnalysis: blueprint.competitorAnalysis || blueprint.competitors || {},
      developmentTimeline: blueprint.developmentTimeline || blueprint.timeline || {},
      marketingStrategy: blueprint.marketingStrategy || blueprint.marketing || {}
    };
    
    console.log('Full blueprint data being saved:', JSON.stringify(dbBlueprint, null, 2));
    
    const result = await this.insert({
      table: 'blueprints',
      data: dbBlueprint,
    });
    
    console.log('Save result:', JSON.stringify(result, null, 2));
    return result;
  },

  /**
   * Get all ideas for the current user
   */
  async getUserIdeas() {
    return this.select({
      table: 'ideas',
      select: '*',
    });
  },

  /**
   * Get an idea with its blueprint
   */
  async getIdeaWithBlueprint(ideaId: string) {
    // First get the idea
    const ideaResult = await this.select({
      table: 'ideas',
      select: '*',
      filters: [{ column: 'id', operator: 'eq', value: ideaId }],
    });

    if (ideaResult.error || !ideaResult.data || ideaResult.data.length === 0) {
      return ideaResult;
    }

    // Then get the blueprint
    const blueprintResult = await this.select({
      table: 'blueprints',
      select: '*',
      filters: [{ column: 'idea_id', operator: 'eq', value: ideaId }],
    });

    // Return combined result
    return {
      success: true,
      data: {
        idea: ideaResult.data[0],
        blueprint: blueprintResult.data && blueprintResult.data.length > 0 
          ? blueprintResult.data[0] 
          : null,
      },
    };
  },
};
