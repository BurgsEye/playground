/**
 * Unit tests for enhanced auto-clustering functionality
 * Tests min/max cluster sizes and precise clustering
 */

import { autoClusterTickets, AutoClusteringOptions } from '../../src/utils/autoClustering';

describe('Enhanced Auto-Clustering Unit Tests', () => {
  // Mock ticket data
  const mockTickets = [
    { id: '1', lat: 40.7128, lng: -74.0060, title: 'Ticket 1', priority: 'High' as const },
    { id: '2', lat: 40.7130, lng: -74.0058, title: 'Ticket 2', priority: 'Medium' as const },
    { id: '3', lat: 40.7132, lng: -74.0056, title: 'Ticket 3', priority: 'Low' as const },
    { id: '4', lat: 40.7134, lng: -74.0054, title: 'Ticket 4', priority: 'High' as const },
    { id: '5', lat: 40.7136, lng: -74.0052, title: 'Ticket 5', priority: 'Medium' as const },
    { id: '6', lat: 40.7138, lng: -74.0050, title: 'Ticket 6', priority: 'Low' as const },
    { id: '7', lat: 40.7140, lng: -74.0048, title: 'Ticket 7', priority: 'High' as const },
    { id: '8', lat: 40.7142, lng: -74.0046, title: 'Ticket 8', priority: 'Medium' as const },
    { id: '9', lat: 40.7144, lng: -74.0044, title: 'Ticket 9', priority: 'Low' as const },
    { id: '10', lat: 40.7146, lng: -74.0042, title: 'Ticket 10', priority: 'High' as const },
  ];

  describe('Precise Clustering', () => {
    test('should create clusters with exactly 3 jobs each', () => {
      const options: AutoClusteringOptions = {
        tickets: mockTickets,
        radius_km: 1,
        precise_cluster_size: 3
      };

      const result = autoClusterTickets(options);

      // All clusters should have exactly 3 tickets
      result.clusters.forEach(cluster => {
        expect(cluster.tickets).toHaveLength(3);
      });

      // Should have multiple clusters
      expect(result.clusters.length).toBeGreaterThan(0);
    });

    test('should skip clusters that cannot meet precise size requirement', () => {
      const options: AutoClusteringOptions = {
        tickets: mockTickets.slice(0, 5), // Only 5 tickets
        radius_km: 0.01, // Very small radius (10 meters)
        precise_cluster_size: 4 // Require exactly 4
      };

      const result = autoClusterTickets(options);

      // Should have no clusters since no group of 4 can fit in 0.01km radius
      expect(result.clusters).toHaveLength(0);
      expect(result.unclustered_tickets).toHaveLength(5);
    });
  });

  describe('Min/Max Clustering', () => {
    test('should create clusters between min and max sizes', () => {
      const options: AutoClusteringOptions = {
        tickets: mockTickets,
        radius_km: 1,
        min_cluster_size: 2,
        max_cluster_size: 4
      };

      const result = autoClusterTickets(options);

      // All clusters should be between 2 and 4 tickets
      result.clusters.forEach(cluster => {
        expect(cluster.tickets.length).toBeGreaterThanOrEqual(2);
        expect(cluster.tickets.length).toBeLessThanOrEqual(4);
      });

      expect(result.clusters.length).toBeGreaterThan(0);
    });

    test('should respect minimum cluster size', () => {
      const options: AutoClusteringOptions = {
        tickets: mockTickets.slice(0, 3),
        radius_km: 0.01, // Very small radius (10 meters)
        min_cluster_size: 3,
        max_cluster_size: 5
      };

      const result = autoClusterTickets(options);

      // Should have no clusters since no group of 3 can fit in 0.01km radius
      expect(result.clusters).toHaveLength(0);
      expect(result.unclustered_tickets).toHaveLength(3);
    });

    test('should respect maximum cluster size', () => {
      const options: AutoClusteringOptions = {
        tickets: mockTickets,
        radius_km: 10, // Large radius
        min_cluster_size: 2,
        max_cluster_size: 3
      };

      const result = autoClusterTickets(options);

      // All clusters should be at most 3 tickets
      result.clusters.forEach(cluster => {
        expect(cluster.tickets.length).toBeLessThanOrEqual(3);
      });
    });
  });

  describe('Backward Compatibility', () => {
    test('should work with old cluster_size parameter', () => {
      const options: AutoClusteringOptions = {
        tickets: mockTickets,
        radius_km: 1,
        cluster_size: 3
      };

      const result = autoClusterTickets(options);

      // All clusters should have exactly 3 tickets (same as precise)
      result.clusters.forEach(cluster => {
        expect(cluster.tickets).toHaveLength(3);
      });

      expect(result.clusters.length).toBeGreaterThan(0);
    });

    test('should use default values when no size parameters provided', () => {
      const options: AutoClusteringOptions = {
        tickets: mockTickets,
        radius_km: 1
        // No size parameters
      };

      const result = autoClusterTickets(options);

      // Should use default min=2, max=5
      result.clusters.forEach(cluster => {
        expect(cluster.tickets.length).toBeGreaterThanOrEqual(2);
        expect(cluster.tickets.length).toBeLessThanOrEqual(5);
      });

      expect(result.clusters.length).toBeGreaterThan(0);
    });
  });

  describe('Priority Handling', () => {
    test('should prioritize high priority tickets in precise clustering', () => {
      const options: AutoClusteringOptions = {
        tickets: mockTickets,
        radius_km: 1,
        precise_cluster_size: 3,
        prioritize_high_priority: true
      };

      const result = autoClusterTickets(options);

      // First cluster should contain high priority tickets
      if (result.clusters.length > 0) {
        const firstCluster = result.clusters[0];
        const highPriorityTickets = firstCluster.tickets.filter(t => t.priority === 'High');
        expect(highPriorityTickets.length).toBeGreaterThan(0);
      }
    });

    test('should prioritize high priority tickets in min/max clustering', () => {
      const options: AutoClusteringOptions = {
        tickets: mockTickets,
        radius_km: 1,
        min_cluster_size: 2,
        max_cluster_size: 4,
        prioritize_high_priority: true
      };

      const result = autoClusterTickets(options);

      // First cluster should contain high priority tickets
      if (result.clusters.length > 0) {
        const firstCluster = result.clusters[0];
        const highPriorityTickets = firstCluster.tickets.filter(t => t.priority === 'High');
        expect(highPriorityTickets.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty ticket list', () => {
      const options: AutoClusteringOptions = {
        tickets: [],
        radius_km: 1,
        precise_cluster_size: 3
      };

      const result = autoClusterTickets(options);

      expect(result.clusters).toHaveLength(0);
      expect(result.unclustered_tickets).toHaveLength(0);
      expect(result.total_clusters).toBe(0);
      expect(result.total_tickets_clustered).toBe(0);
    });

    test('should handle single ticket', () => {
      const options: AutoClusteringOptions = {
        tickets: [mockTickets[0]],
        radius_km: 1,
        min_cluster_size: 2,
        max_cluster_size: 4
      };

      const result = autoClusterTickets(options);

      expect(result.clusters).toHaveLength(0);
      expect(result.unclustered_tickets).toHaveLength(1);
    });

    test('should handle very small radius', () => {
      const options: AutoClusteringOptions = {
        tickets: mockTickets,
        radius_km: 0.001, // Very small radius (1 meter)
        min_cluster_size: 2,
        max_cluster_size: 4
      };

      const result = autoClusterTickets(options);

      // Should have no clusters due to small radius
      expect(result.clusters).toHaveLength(0);
      expect(result.unclustered_tickets).toHaveLength(mockTickets.length);
    });
  });

  describe('Algorithm Statistics', () => {
    test('should return correct algorithm stats', () => {
      const options: AutoClusteringOptions = {
        tickets: mockTickets,
        radius_km: 1,
        precise_cluster_size: 3
      };

      const result = autoClusterTickets(options);

      expect(result.algorithm_stats).toBeDefined();
      expect(result.algorithm_stats.method).toBe('Greedy Geographic Clustering');
      expect(result.algorithm_stats.execution_time_ms).toBeGreaterThanOrEqual(0);
      expect(result.algorithm_stats.iterations).toBeGreaterThan(0);
    });
  });
});
